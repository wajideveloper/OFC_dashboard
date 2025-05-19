import { Paper, Table, Title, Stack, Text, Button } from '@mantine/core';
import { useMap } from '../../context/MapContext';

const calculateCentroid = (geometry) => {
  if (!geometry || !geometry.coordinates) return 'N/A';

  let coords = [];
  if (geometry.type === 'Polygon') {
    coords = geometry.coordinates[0]; // Use the first ring (exterior boundary)
  } else if (geometry.type === 'MultiPolygon') {
    coords = geometry.coordinates.flatMap((poly) => poly[0]); // Flatten all exterior rings
  } else {
    return 'N/A'; // Return N/A for non-polygon geometries
  }

  if (coords.length === 0) return 'N/A';

  const centroid = coords.reduce(
    (acc, [lon, lat]) => {
      acc[0] += lon;
      acc[1] += lat;
      return acc;
    },
    [0, 0]
  );

  return `[${(centroid[0] / coords.length).toFixed(4)}, ${(centroid[1] / coords.length).toFixed(4)}]`;
};

export default function MapPopup() {
  const { selectedFeature, closePopup } = useMap();

  if (!selectedFeature) return null;

  const properties = selectedFeature.properties || {};
  const geometry = selectedFeature.geometry || {};
  const propertyEntries = Object.entries(properties);
  const geometryEntries = [
    ['Type', geometry.type || 'N/A'],
    ['Centroid', calculateCentroid(geometry)],
  ];

  return (
    <Paper
      p="md"
      shadow="md"
      style={{
        position: 'absolute',
        left: selectedFeature.x,
        top: selectedFeature.y,
        zIndex: 1000,
        maxWidth: 500,
        backgroundColor: 'var(--mantine-color-body)',
        borderRadius: 8,
        animation: 'fadeIn 0.2s ease-in-out',
      }}
    >
      <Stack gap="xs">
        <Title order={5}>Feature Details</Title>
        {propertyEntries.length > 0 || geometryEntries.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Property</Table.Th>
                <Table.Th>Value</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {geometryEntries.map(([key, value]) => (
                <Table.Tr key={key}>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {key}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{value}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
              {propertyEntries.map(([key, value]) => (
                <Table.Tr key={key}>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {key}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{value !== null && value !== undefined ? value : 'N/A'}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text size="sm" c="dimmed">
            No properties or geometry available
          </Text>
        )}
        <Button size="xs" variant="outline" onClick={closePopup}>
          Close
        </Button>
      </Stack>
    </Paper>
  );
}