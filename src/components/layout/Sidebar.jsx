import { useState, useCallback } from 'react';
import {
  Stack,
  Text,
  Title,
  Divider,
  Accordion,
  Checkbox,
  RangeSlider,
  Group,
  Badge,
  Button,
  Box,
  TextInput,
  Select,
  MultiSelect,
  Paper,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { Filter, X, Wand2, MapPin } from 'lucide-react';
import { IconUpload } from '@tabler/icons-react';
import { useData } from '../../context/DataContext';
import { useMap } from '../../context/MapContext';
import * as toGeoJSON from '@tmcw/togeojson';
import Papa from 'papaparse';
import JSZip from 'jszip';
import shp from 'shpjs';
import mapboxgl from 'mapbox-gl';

export default function Sidebar() {
  const { filterData, resetFilters } = useData();
  const { loadExternalData, toggleLayerVisibility, uploadedFiles, map, isMapLoaded } = useMap();
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedLayers, setSelectedLayers] = useState([]);
  const [streetName, setStreetName] = useState('');
  const [neighborhood, setNeighborhood] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [material, setMaterial] = useState(null);
  const [condition, setCondition] = useState(null);
  const [year, setYear] = useState(null);

  const handleFileDrop = useCallback(
    async (files) => {
      try {
        const file = files[0];
        const fileName = file.name.toLowerCase();
        let geojson;

        if (fileName.endsWith('.kmz')) {
          const zip = await JSZip.loadAsync(file);
          const kmlFile = Object.values(zip.files).find((f) => f.name.endsWith('.kml'));
          if (kmlFile) {
            const kmlText = await kmlFile.async('text');
            const dom = new DOMParser().parseFromString(kmlText, 'text/xml');
            geojson = toGeoJSON.kml(dom);
            console.log(`KMZ GeoJSON Data (${fileName}):`, geojson);
            loadExternalData(geojson, fileName);
            setSelectedLayers((prev) => [...prev, fileName]);
          } else {
            alert('No KML file found in KMZ archive');
          }
        } else if (fileName.endsWith('.kml')) {
          const text = await file.text();
          const dom = new DOMParser().parseFromString(text, 'text/xml');
          geojson = toGeoJSON.kml(dom);
          console.log(`KML GeoJSON Data (${fileName}):`, geojson);
          loadExternalData(geojson, fileName);
          setSelectedLayers((prev) => [...prev, fileName]);
        } else if (fileName.endsWith('.csv')) {
          Papa.parse(file, {
            header: true,
            complete: (results) => {
              const features = results.data
                .filter((row) => row.latitude && row.longitude && !isNaN(+row.latitude) && !isNaN(+row.longitude))
                .map((row) => ({
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [+row.longitude, +row.latitude],
                  },
                  properties: row,
                }));
              geojson = { type: 'FeatureCollection', features };
              console.log(`CSV GeoJSON Data (${fileName}):`, geojson);
              loadExternalData(geojson, fileName);
              setSelectedLayers((prev) => [...prev, fileName]);
            },
            error: (error) => {
              console.error('CSV parsing error:', error);
              alert('Error parsing CSV file');
            },
          });
        } else if (fileName.endsWith('.zip') || files.some((f) => f.name.toLowerCase().endsWith('.shp'))) {
          const shpFile = files.find((f) => f.name.toLowerCase().endsWith('.shp'));
          if (shpFile) {
            const buffers = await Promise.all(files.map(async (f) => ({
              name: f.name,
              buffer: await f.arrayBuffer(),
            })));
            const shpBuffer = buffers.find((b) => b.name.toLowerCase().endsWith('.shp')).buffer;
            const dbfBuffer = buffers.find((b) => b.name.toLowerCase().endsWith('.dbf'))?.buffer;
            const shxBuffer = buffers.find((b) => b.name.toLowerCase().endsWith('.shx'))?.buffer;
            geojson = await shp({ shp: shpBuffer, dbf: dbfBuffer, shx: shxBuffer });
            if (Array.isArray(geojson)) geojson = geojson[0];
            console.log(`Shapefile GeoJSON Data (${shpFile.name}):`, geojson);
            loadExternalData(geojson, shpFile.name);
            setSelectedLayers((prev) => [...prev, shpFile.name]);
          } else {
            alert('Shapefile requires at least a .shp file');
          }
        } else {
          alert('Unsupported file type');
        }
      } catch (error) {
        console.error('Error reading file:', error);
        alert('Error processing file');
      }
    },
    [loadExternalData]
  );

  const handleLayerChange = (checked, fileName) => {
    setSelectedLayers((prev) => {
      const newLayers = checked ? [...prev, fileName] : prev.filter((name) => name !== fileName);
      toggleLayerVisibility(fileName, checked);
      return newLayers;
    });
  };

  const handleZoomToLayer = (fileName) => {
    if (!map || !isMapLoaded) {
      console.warn('Map not initialized');
      return;
    }

    const file = uploadedFiles.find((f) => f.fileName === fileName);
    if (!file || !file.geojson) {
      console.warn(`No GeoJSON data found for layer: ${fileName}`);
      return;
    }

    const coordinates = file.geojson.features
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

    if (coordinates.length === 0) {
      console.warn(`No valid coordinates found for layer: ${fileName}`);
      return;
    }

    const bounds = coordinates.reduce(
      (b, coord) => b.extend([coord[0], coord[1]]),
      new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
    );

    map.fitBounds(bounds, {
      padding: 50,
      duration: 1000,
      maxZoom: 15, // Prevent excessive zooming for small areas
    });
  };

  const handleApplyFilters = () => {
    filterData({
      priceRange,
      streetName,
      neighborhood,
      districts,
      material,
      condition,
      year,
    });
  };

  const handleResetFilters = () => {
    setPriceRange([0, 5000]);
    setSelectedLayers([]);
    setStreetName('');
    setNeighborhood(null);
    setDistricts([]);
    setMaterial(null);
    setCondition(null);
    setYear(null);
    resetFilters();
    uploadedFiles.forEach((file) => toggleLayerVisibility(file.fileName, false));
  };

  return (
    <Box p="md" h="100%">
      <Group justify="space-between" mb="xs">
        <Title order={4} size="h5">
          Filters
        </Title>
        <Button
          variant="subtle"
          size="compact-sm"
          color="gray"
          leftSection={<X size={14} />}
          onClick={handleResetFilters}
        >
          Reset
        </Button>
      </Group>
      <Divider mb="md" />
      <Paper p="md" shadow="sm" withBorder>
        <Dropzone
          onDrop={handleFileDrop}
          accept={{
            'application/vnd.google-earth.kml+xml': ['.kml'],
            'application/vnd.google-earth.kmz': ['.kmz'],
            'text/csv': ['.csv'],
            'application/octet-stream': ['.shp', '.shx', '.dbf', '.prj'],
            'application/zip': ['.zip'],
          }}
          multiple={true}
          style={{
            border: '2px dashed #4dabf7',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            transition: 'all 0.2s ease',
          }}
        >
          <Group justify="center" gap="xl" mih={100} style={{ pointerEvents: 'none' }}>
            <Dropzone.Accept>
              <IconUpload size={32} color="#339af0" />
              <Text size="lg" c="blue" inline>
                Drop files here
              </Text>
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconUpload size={32} color="#ff6b6b" />
              <Text size="lg" c="red" inline>
                File type not accepted
              </Text>
            </Dropzone.Reject>
            <Dropzone.Idle>
              <Stack align="center" gap="xs">
                <IconUpload size={32} color="#868e96" />
                <Text size="lg" c="dimmed" inline>
                  Drag KML, KMZ, CSV, or Shapefile (.shp, .shx, .dbf) here
                </Text>
                <Text size="xs" c="dimmed" inline>
                  Multiple files allowed for shapefiles
                </Text>
              </Stack>
            </Dropzone.Idle>
          </Group>
        </Dropzone>
      </Paper>
      <Divider mb="md" />
      <Accordion defaultValue="layers" mx="-md">
        <Accordion.Item value="layers">
          <Accordion.Control icon={<Filter size={16} />}>Layers</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              {uploadedFiles.length === 0 ? (
                <Text size="sm" c="dimmed">
                  No layers uploaded
                </Text>
              ) : (
                uploadedFiles.map((file) => (
                  <div
                    key={file.fileName}
                    className="flex items-center justify-between w-full flex-nowrap px-2 py-1"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <Checkbox
                        checked={selectedLayers.includes(file.fileName)}
                        onChange={(e) => handleLayerChange(e.currentTarget.checked, file.fileName)}
                      />
                      <Tooltip label={file.fileName}>
                        <span className="ml-2 text-sm truncate max-w-[200px] sm:max-w-[300px]">
                          {file.fileName}
                        </span>
                      </Tooltip>
                    </div>
                    <Tooltip label="Zoom to layer">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        size="sm"
                        onClick={() => handleZoomToLayer(file.fileName)}
                        disabled={!isMapLoaded}
                        className="ml-2"
                      >
                        <MapPin size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </div>
                ))
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="location">
          <Accordion.Control icon={<Filter size={16} />}>Location</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <TextInput
                label="Street Name"
                placeholder="e.g. Main St"
                value={streetName}
                onChange={(e) => setStreetName(e.currentTarget.value)}
              />
              <Select
                label="Neighborhood"
                placeholder="Select neighborhood"
                data={['Downtown', 'North End', 'South End', 'West Side', 'East Side']}
                value={neighborhood}
                onChange={setNeighborhood}
              />
              <MultiSelect
                label="Districts"
                placeholder="Select districts"
                data={['Commercial', 'Residential', 'Industrial', 'Historic']}
                value={districts}
                onChange={setDistricts}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="price">
          <Accordion.Control icon={<Filter size={16} />}>Installation Cost</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Price Range ($)
              </Text>
              <RangeSlider
                min={0}
                max={5000}
                step={100}
                minRange={500}
                value={priceRange}
                onChange={setPriceRange}
                thumbLabel={(value) => `$${value}`}
                marks={[
                  { value: 0, label: '$0' },
                  { value: 2500, label: '$2,500' },
                  { value: 5000, label: '$5,000' },
                ]}
              />
              <Group justify="space-between">
                <Badge variant="light">${priceRange[0]}</Badge>
                <Badge variant="light">${priceRange[1]}</Badge>
              </Group>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="properties">
          <Accordion.Control icon={<Filter size={16} />}>Properties</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <Select
                label="Material"
                placeholder="Select material"
                data={['Metal', 'Concrete', 'Composite', 'Plastic']}
                value={material}
                onChange={setMaterial}
              />
              <Select
                label="Condition"
                placeholder="Select condition"
                data={['Excellent', 'Good', 'Fair', 'Poor']}
                value={condition}
                onChange={setCondition}
              />
              <Select
                label="Installation Year"
                placeholder="Select year"
                data={Array.from({ length: 30 }, (_, i) => (2023 - i).toString())}
                value={year}
                onChange={setYear}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Divider my="md" />
      <Button
        fullWidth
        variant="filled"
        color="blue"
        leftSection={<Wand2 size={14} />}
        onClick={handleApplyFilters}
      >
        Apply Filters
      </Button>
    </Box>
  );
}