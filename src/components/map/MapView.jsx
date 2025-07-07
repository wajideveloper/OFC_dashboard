import { useEffect, useRef } from 'react';
import { Box, Loader, ActionIcon, Group, Paper, Tooltip } from '@mantine/core';
import { ZoomIn, ZoomOut, Home } from 'lucide-react';
import { useMap } from '../../context//MapContext';
import { useData } from '../../context/DataContext';
import MapPopup from './MapPopup';
import MapLegend from './MapLegend';
import MapDrawTool from './MapDrawTool';

export default function MapView() {
  const mapContainerRef = useRef(null); // this is use to tell mapbox gl where to create the map
  const { initializeMap, map, isMapLoaded, zoomIn, zoomOut, resetView } = useMap();
  const { filteredData } = useData();

  useEffect(() => {
    if (mapContainerRef.current && !map) {
      if (!mapContainerRef.current.classList.contains('mapboxgl-map')) {
        initializeMap(mapContainerRef.current);
      }
    }
  }, [initializeMap, map]);

  useEffect(() => {
    if (map && isMapLoaded && map.getSource('features')) {
      map.getSource('features').setData({
        type: 'FeatureCollection',
        features: filteredData,
      });
    }
  }, [map, isMapLoaded, filteredData]);

  return (
    <Box pos="relative" h="90vh" >
      <div
        ref={mapContainerRef}
        pos='absolute'
        style={{
          width: '100vw',
          height: '100%',
          backgroundColor: '#f8f9fa',
        }}
      />
      {!isMapLoaded && (
        <Box
          pos="absolute"
          top="50%"
          left="50%"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <Loader size="lg" />
        </Box>
      )}
      
      <MapPopup />
      
      <Paper
        shadow="sm"
        p="xs"
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          borderRadius: '4px',
        }}
      >
        <Group>
          <Tooltip label="Zoom in">
            <ActionIcon variant="default" onClick={zoomIn} aria-label="Zoom in">
              <ZoomIn size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Zoom out">
            <ActionIcon variant="default" onClick={zoomOut} aria-label="Zoom out">
              <ZoomOut size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Reset view">
            <ActionIcon variant="default" onClick={resetView} aria-label="Reset view">
              <Home size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Paper>
      <Box pos="absolute" bottom="20px" left="20px">
        <MapLegend />
      </Box>
      <Box pos="absolute" top="20px" left="20px">
        {map && isMapLoaded && <MapDrawTool map={map} />}
      </Box>
    </Box>
  );
}