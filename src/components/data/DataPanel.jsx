import { useState, useMemo } from 'react';
import {
  Stack,
  Tabs,
  Title,
  Divider,
  Text,
  Button,
  Group,
  Table,
  Pagination,
  Select,
  CopyButton,
  ActionIcon,
  Tooltip,
  Box,
} from '@mantine/core';
import {
  FileText,
  BarChart,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { useMap } from '../../context/MapContext';
import FeatureChart from './FeatureChart';

export default function DataPanel() {
  const { uploadedFiles } = useMap();
  const [selectedFile, setSelectedFile] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const data = useMemo(() => {
    if (!selectedFile) {
      return uploadedFiles.length > 0 ? uploadedFiles[0].geojson?.features || [] : [];
    }
    const file = uploadedFiles.find((f) => f.fileName === selectedFile);
    return file ? file.geojson?.features || [] : [];
  }, [selectedFile, uploadedFiles]);

  const propertyKeys = useMemo(() => {
    const keys = new Set();
    data.forEach((feature) => {
      if (feature.properties) {
        Object.keys(feature.properties).forEach((key) => keys.add(key));
      }
    });
    return Array.from(keys);
  }, [data]);

  const columns = useMemo(() => {
    return ['Geometry', ...propertyKeys];
  }, [propertyKeys]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;
    return [...data].sort((a, b) => {
      const aValue = sortColumn === 'Geometry' ? a.geometry?.type ?? '' : a.properties?.[sortColumn] ?? '';
      const bValue = sortColumn === 'Geometry' ? b.geometry?.type ?? '' : b.properties?.[sortColumn] ?? '';
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [data, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    const start = (activePage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, activePage, rowsPerPage]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (column) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const getCSVContent = () => {
    if (data.length === 0) return '';
    const headers = columns.join(',');
    const rows = data.map((feature) => {
      const values = columns.map((col) => {
        let value = col === 'Geometry' ? feature.geometry?.type ?? 'N/A' : feature.properties?.[col] ?? 'N/A';
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }
        value = String(value).replace(/"/g, '""');
        return `"${value}"`;
      });
      return values.join(',');
    });
    return `${headers}\n${rows.join('\n')}`;
  };

  const renderCellValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <Box h="100%" p="md">
      <Group justify="space-between" mb="xs">
        <Title order={4} size="h5">
          Data Explorer
        </Title>
        <Button
          variant="subtle"
          size="compact-sm"
          leftSection={<Download size={14} />}
          onClick={() => {
            const csv = getCSVContent();
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedFile || 'data'}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          disabled={data.length === 0}
        >
          Export
        </Button>
      </Group>

      <Divider mb="xs" />

      <Group mb="xs">
        <Select
          placeholder="Select file"
          data={uploadedFiles.map((file) => ({
            value: file.fileName,
            label: file.fileName,
          }))}
          value={selectedFile}
          onChange={(value) => {
            setSelectedFile(value);
            setActivePage(1);
            setSortColumn(null);
            setSortDirection('asc');
          }}
          style={{ width: 200 }}
          disabled={uploadedFiles.length === 0}
        />
      </Group>

      <Tabs defaultValue="table">
        <Tabs.List>
          <Tabs.Tab value="table" leftSection={<FileText size={14} />}>
            Table
          </Tabs.Tab>
          <Tabs.Tab value="chart" leftSection={<BarChart size={14} />}>
            Charts
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="table" pt="xs">
          {data.length === 0 ? (
            <Text size="sm" c="dimmed">
              No data available. Upload a file in the sidebar to view its attributes.
            </Text>
          ) : (
            <>
              <Group justify="space-between" mb="xs">
                <Text size="sm">
                  Showing {(activePage - 1) * rowsPerPage + 1}-
                  {Math.min(activePage * rowsPerPage, data.length)} of {data.length} items
                </Text>
                <Group>
                  <Button
                    variant="subtle"
                    size="compact-sm"
                    leftSection={<Filter size={14} />}
                    disabled
                  >
                    Filter
                  </Button>
                  <Select
                    size="xs"
                    value={rowsPerPage.toString()}
                    data={['10', '25', '50', '100']}
                    style={{ width: 80 }}
                    onChange={(value) => {
                      setRowsPerPage(Number(value));
                      setActivePage(1);
                    }}
                  />
                </Group>
              </Group>

              <div style={{ overflowX: 'auto' }}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      {columns.map((column) => (
                        <Table.Th
                          key={column}
                          style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                          onClick={() => handleSort(column)}
                        >
                          <Group gap={4}>
                            {column} {renderSortIcon(column)}
                          </Group>
                        </Table.Th>
                      ))}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {paginatedData.map((feature, index) => (
                      <Table.Tr key={feature.properties?.id || index}>
                        {columns.map((column) => (
                          <Table.Td key={column}>
                            {column === 'Geometry'
                              ? feature.geometry?.type ?? 'N/A'
                              : renderCellValue(feature.properties?.[column])}
                          </Table.Td>
                        ))}
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>

              <Group justify="space-between" mt="md">
                <Text size="sm">
                  <CopyButton value={getCSVContent()} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy data as CSV'}>
                        <ActionIcon
                          color={copied ? 'teal' : 'gray'}
                          variant="subtle"
                          onClick={copy}
                          disabled={data.length === 0}
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>{' '}
                  Copy as CSV
                </Text>
                <Pagination
                  total={Math.ceil(data.length / rowsPerPage)}
                  value={activePage}
                  onChange={setActivePage}
                  size="sm"
                  disabled={data.length === 0}
                />
              </Group>
            </>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="chart" pt="xs">
          <FeatureChart data={data} />
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}