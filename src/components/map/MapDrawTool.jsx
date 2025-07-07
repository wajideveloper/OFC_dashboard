// src/components/MapDrawTool.jsx
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

const MapDrawTool = ({ map }) => {
  const drawRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        line_string: true,
        trash: true,
      },
    });
    drawRef.current = draw;
    map.addControl(draw, 'top-left');

    const showMeasurement = (e) => {
      const features = draw.getAll().features;
      if (features.length === 0) return;

      const feature = features[0];
      let content = '';
      let center = [0, 0];

      if (feature.geometry.type === 'LineString') {
        const length = turf.length(feature, { units: 'kilometers' });
        content = `Distance: ${length.toFixed(2)} km`;
        center = turf.midpoint(
          turf.point(feature.geometry.coordinates[0]),
          turf.point(feature.geometry.coordinates[feature.geometry.coordinates.length - 1])
        ).geometry.coordinates;
      } else if (feature.geometry.type === 'Polygon') {
        const area = turf.area(feature);
        content =
          area > 1000000
            ? `Area: ${(area / 1e6).toFixed(2)} km²`
            : `Area: ${area.toFixed(2)} m²`;
        center = turf.center(feature).geometry.coordinates;
      }

      new mapboxgl.Popup()
        .setLngLat(center)
        .setHTML(`<div class="text-sm">${content}</div>`)
        .addTo(map);
    };

    const clearPopup = () => {
      document.querySelectorAll('.mapboxgl-popup').forEach(p => p.remove());
    };

    map.on('draw.create', showMeasurement);
    map.on('draw.update', showMeasurement);
    map.on('draw.delete', clearPopup);

    return () => {
      map.removeControl(draw);
      map.off('draw.create', showMeasurement);
      map.off('draw.update', showMeasurement);
      map.off('draw.delete', clearPopup);
    };
  }, [map]);

  return null;
};

export default MapDrawTool;
