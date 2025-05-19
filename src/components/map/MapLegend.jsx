import { Paper, Stack, Text, Group, Box } from '@mantine/core';
import { Circle, Square } from 'lucide-react';
import { useMap } from '../../context/MapContext';
import { MdOutlinePolyline } from "react-icons/md";

export default function MapLegend() {
  const { uploadedFiles } = useMap();

  const getIconForGeometry = (geometryTypes) => {
    if (geometryTypes.includes('Point')) {
      return <Circle size={12} fill="#FF5733" stroke="#fff" />;
    } else if (geometryTypes.includes('LineString')) {
      return <MdOutlinePolyline size={12} stroke="#33A1FF" />;
    } else if (geometryTypes.includes('Polygon') || geometryTypes.includes('MultiPolygon')) {
      return <Square size={12} fill="#FFDA33" fillOpacity={0.5} stroke="#fff" />;
    }
    return <Circle size={12} fill="#ccc" stroke="#fff" />;
  };

  return (
    <Paper
      shadow="sm"
      p="md"
      style={{
        zIndex: 1000,
        backgroundColor: 'var(--mantine-color-body)',
      }}
    >
      <Stack gap="xs">
        <Text size="sm" fw={500}>
          Legend
        </Text>
        {uploadedFiles.length === 0 ? (
          <Text size="xs" c="dimmed">
            No layers uploaded
          </Text>
        ) : (
          uploadedFiles.map((file) => (
            <Group key={file.fileName} gap="xs">
              {getIconForGeometry(file.geometryTypes)}
              <Text size="xs">{file.fileName}</Text>
            </Group>
          ))
        )}
      </Stack>
    </Paper>
  );
}