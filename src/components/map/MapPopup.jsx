import { Paper, Table, Title, Stack, Text, Button } from '@mantine/core';
import { useMap } from '../../context/MapContext';

// Haversine formula to calculate distance between two points (in kilometers)
const haversineDistance = ([lon1, lat1], [lon2, lat2]) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate the total length of a LineString
const calculateLineStringLength = (geometry) => {
  if (!geometry || geometry.type !== 'LineString' || !geometry.coordinates) {
    return 'N/A';
  }

  const coords = geometry.coordinates;
  if (coords.length < 2) return '0.00 km';

  const totalLength = coords.reduce((sum, _, index) => {
    if (index === 0) return sum;
    const distance = haversineDistance(coords[index - 1], coords[index]);
    return sum + distance;
  }, 0);

  return `${totalLength.toFixed(2)} km`;
};

export default function MapPopup() {
  const { selectedFeature, closePopup } = useMap();

  if (!selectedFeature) return null;

  const properties = selectedFeature.properties || {};
  const geometry = selectedFeature.geometry || {};

  // Define the fields to display
  const desiredProperties = ['name', 'Length', 'GIS_Client']; // GIS_Client as proxy for city
  const propertyEntries = Object.entries(properties).filter(([key]) =>
    desiredProperties.includes(key)
  );
  const geometryEntries = [
    ['Type', geometry.type || 'N/A'],
    ['Geometric Length', calculateLineStringLength(geometry)],
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
                <Table.Th>description</Table.Th>
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
                      {key === 'name' ? 'Name' : key === 'Length' ? 'Length (Properties)' : 'City'}
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