import { useState, useMemo, useEffect } from 'react';
import { 
  Stack, 
  Title, 
  Group, 
  SegmentedControl, 
  Select, 
  Paper,
  Text,
} from '@mantine/core';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function FeatureChart({ data }) {
  const [chartType, setChartType] = useState('bar');
  const [dataType, setDataType] = useState('geometry');
  const [isVisible, setIsVisible] = useState(false);

  // Check if the chart container is visible
  useEffect(() => {
    const checkVisibility = () => {
      const panel = document.querySelector('.mantine-Tabs-panel');
      if (panel) {
        setIsVisible(panel.offsetWidth > 0 && panel.offsetHeight > 0);
      }
    };
    checkVisibility();
    window.addEventListener('resize', checkVisibility);
    return () => window.removeEventListener('resize', checkVisibility);
  }, []);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    if (dataType === 'geometry') {
      const geometryCounts = data.reduce((acc, feature) => {
        const type = feature.geometry?.type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      return Object.entries(geometryCounts).map(([name, value]) => ({
        name,
        value,
      }));
    } else {
      // Aggregate by a sample property (e.g., 'name' or first available property)
      const propKey = data[0]?.properties ? Object.keys(data[0].properties)[0] : null;
      if (!propKey) return [];
      const propCounts = data.reduce((acc, feature) => {
        const value = feature.properties?.[propKey] || 'Unknown';
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {});
      return Object.entries(propCounts)
        .map(([name, value]) => ({
          name: String(name).slice(0, 20), // Truncate long names
          value,
        }))
        .slice(0, 10); // Limit to top 10 for readability
    }
  }, [data, dataType]);

  if (!isVisible || chartData.length === 0) {
    return (
      <Stack>
        <Title order={5}>Feature Distribution</Title>
        <Text size="sm" c="dimmed">
          No data available or panel is not visible. Upload a file or open the panel.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={5}>Feature Distribution</Title>
        <Group>
          <Select
            size="xs"
            value={dataType}
            onChange={(value) => setDataType(value || 'geometry')}
            data={[
              { value: 'geometry', label: 'By Geometry Type' },
              { value: 'property', label: 'By Property' },
            ]}
            style={{ width: 150 }}
          />
          <SegmentedControl
            size="xs"
            value={chartType}
            onChange={setChartType}
            data={[
              { value: 'bar', label: 'Bar' },
              { value: 'pie', label: 'Pie' },
            ]}
          />
        </Group>
      </Group>
      
      <Paper
        p="md"
        style={{ height: 300, minWidth: 300, overflow: 'hidden' }}
      >
        {chartType === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0066CC" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Count']} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Paper>
      
      <Text size="sm" c="dimmed" mt="xs">
        {dataType === 'geometry' && 'Distribution of feature geometry types.'}
        {dataType === 'property' && 'Distribution of feature properties.'}
      </Text>
    </Stack>
  );
}