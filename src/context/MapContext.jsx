
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useData } from './DataContext';

const MapContext = createContext();

export function MapProvider({ children }) {
  const [map, setMap] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const initialCenter = [73.0363, 33.6995];
  const initialZoom = 11.5;

  const registerClickEvents = useCallback(
    (mapInstance, layerId) => {
      mapInstance.on('click', layerId, (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const coordinates =
            feature.geometry.type === 'Point' ? feature.geometry.coordinates.slice() : null;

          if (e.point) {
            setSelectedFeature({
              x: e.point.x,
              y: e.point.y,
              properties: feature.properties || {},
              geometry: feature.geometry || {},
            });
          }
        }
      });

      mapInstance.on('mouseenter', layerId, () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });

      mapInstance.on('mouseleave', layerId, () => {
        mapInstance.getCanvas().style.cursor = '';
      });
    },
    []
  );

  const initializeMap = useCallback(
    (container) => {
      mapboxgl.accessToken = 'pk.eyJ1IjoiYXJmYWtsIiwiYSI6ImNsYnQzd284eDA5OGUzcHBmc2VjOTJ4dzEifQ.RFRiN_WHNN8c4zO7nt2XLA';

      try {
        const mapInstance = new mapboxgl.Map({
          container,
          style: mapStyle,
          center: initialCenter,
          zoom: initialZoom,
        });

        mapInstance.on('load', () => {
          console.log('Map loaded');
          setIsMapLoaded(true);
        });

        mapInstance.on('error', (e) => {
          console.error('Mapbox error:', e);
        });

        setMap(mapInstance);
        return mapInstance;
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    },
    [mapStyle]
  );

  const loadExternalData = useCallback(
    (geojsonData, fileName) => {
      if (map && isMapLoaded) {
        const layerId = `layer-${fileName.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const sourceId = `source-${fileName.replace(/[^a-zA-Z0-9]/g, '-')}`;

        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);

        map.addSource(sourceId, {
          type: 'geojson',
          data: geojsonData,
        });

        const geometryTypes = new Set(
          geojsonData.features.map((f) => f.geometry?.type).filter(Boolean)
        );

        const layerConfig = {
          id: layerId,
          source: sourceId,
        };

        if (geometryTypes.has('Point')) {
          layerConfig.type = 'circle';
          layerConfig.paint = {
            'circle-radius': 8,
            'circle-color': '#FF5733',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
          };
        } else if (geometryTypes.has('LineString')) {
          layerConfig.type = 'line';
          layerConfig.paint = {
            'line-color': '#33A1FF',
            'line-width': 3,
          };
        } else if (geometryTypes.has('Polygon') || geometryTypes.has('MultiPolygon')) {
          layerConfig.type = 'fill';
          layerConfig.paint = {
            'fill-color': '#FFDA33',
            'fill-opacity': 0.5,
          };
        } else {
          layerConfig.type = 'circle';
          layerConfig.paint = {
            'circle-radius': 8,
            'circle-color': '#ccc',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
          };
        }

        map.addLayer(layerConfig);
        registerClickEvents(map, layerId);

        setUploadedFiles((prev) => {
          const newFiles = prev.filter((f) => f.fileName !== fileName);
          return [
            ...newFiles,
            { fileName, layerId, sourceId, geojson: geojsonData, geometryTypes: Array.from(geometryTypes) },
          ];
        });

        const coordinates = geojsonData.features
          .filter((f) => f.geometry && f.geometry.coordinates)
          .flatMap((f) => {
            if (f.geometry.type === 'Point') {
              return [f.geometry.coordinates];
            } else if (f.geometry.type === 'LineString') {
              return f.geometry.coordinates;
            } else if (f.geometry.type === 'Polygon') {
              return f.geometry.coordinates[0];
            } else if (f.geometry.type === 'MultiPolygon') {
              return f.geometry.coordinates.flatMap((poly) => poly[0]);
            }
            return [];
          })
          .filter((coord) => Array.isArray(coord) && coord.length >= 2 && !isNaN(coord[0]) && !isNaN(coord[1]));

        if (coordinates.length > 0) {
          const bounds = coordinates.reduce(
            (b, coord) => b.extend([coord[0], coord[1]]),
            new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
          );
          map.fitBounds(bounds, { padding: 50, duration: 1000 });
        }
      }
    },
    [map, isMapLoaded, registerClickEvents]
  );

  const toggleLayerVisibility = useCallback(
    (fileName, visible) => {
      if (map && isMapLoaded) {
        const layerId = `layer-${fileName.replace(/[^a-zA-Z0-9]/g, '-')}`;
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
        }
      }
    },
    [map, isMapLoaded]
  );

  const changeMapStyle = useCallback(
    (styleId) => {
      if (map && isMapLoaded) {
        setMapStyle(styleId);
        map.setStyle(styleId);
        // Re-add layers after style load
        map.once('style.load', () => {
          uploadedFiles.forEach((file) => {
            const { geojson, fileName, layerId, sourceId } = file;
            if (!map.getSource(sourceId)) {
              map.addSource(sourceId, {
                type: 'geojson',
                data: geojson,
              });

              const geometryTypes = new Set(
                geojson.features.map((f) => f.geometry?.type).filter(Boolean)
              );

              const layerConfig = {
                id: layerId,
                source: sourceId,
              };

              if (geometryTypes.has('Point')) {
                layerConfig.type = 'circle';
                layerConfig.paint = {
                  'circle-radius': 8,
                  'circle-color': '#FF5733',
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#fff',
                };
              } else if (geometryTypes.has('LineString')) {
                layerConfig.type = 'line';
                layerConfig.paint = {
                  'line-color': '#33A1FF',
                  'line-width': 3,
                };
              } else if (geometryTypes.has('Polygon') || geometryTypes.has('MultiPolygon')) {
                layerConfig.type = 'fill';
                layerConfig.paint = {
                  'fill-color': '#FFDA33',
                  'fill-opacity': 0.5,
                };
              } else {
                layerConfig.type = 'circle';
                layerConfig.paint = {
                  'circle-radius': 8,
                  'circle-color': '#ccc',
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#fff',
                };
              }

              map.addLayer(layerConfig);
              registerClickEvents(map, layerId);
            }
          });
        });
      } else {
        setMapStyle(styleId); // Update style for initialization
      }
    },
    [map, isMapLoaded, uploadedFiles, registerClickEvents]
  );


  const zoomIn = useCallback(() => {
    if (map) map.zoomIn();
  }, [map]);

  const zoomOut = useCallback(() => {
    if (map) map.zoomOut();
  }, [map]);

  const resetView = useCallback(() => {
    if (map) {
      map.flyTo({
        center: initialCenter,
        zoom: initialZoom,
        duration: 1000,
      });
    }
  }, [map]);

  const closePopup = useCallback(() => {
    setSelectedFeature(null);
  }, []);


  useEffect(() => {
    return () => {
      if (map) map.remove();
    };
  }, [map]);

  return (
    <MapContext.Provider
      value={{
        map,
        isMapLoaded,
        selectedFeature,
        initializeMap,
        zoomIn,
        zoomOut,
        resetView,
        closePopup,
        mapStyle,
        loadExternalData,
        changeMapStyle,
        toggleLayerVisibility,
        uploadedFiles,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
}
