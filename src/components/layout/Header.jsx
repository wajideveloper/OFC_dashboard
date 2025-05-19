import { useState } from 'react';
import { 
  Group, 
  Button, 
  Title, 
  ActionIcon, 
  Tooltip, 
  TextInput, 
  Menu, 
  Divider,
  Select,
  useMantineColorScheme,
  rem,
} from '@mantine/core';
import { Menu as Menu2, Search, Table, Download, Moon, Sun, Layers, Map } from 'lucide-react';
import { useMap } from '../../context/MapContext';
import { SearchBox } from '@mapbox/search-js-react';
import mapboxgl from 'mapbox-gl';

const accessToken = 'pk.eyJ1IjoiYXJmYWtsIiwiYSI6ImNsYnQzd284eDA5OGUzcHBmc2VjOTJ4dzEifQ.RFRiN_WHNN8c4zO7nt2XLA';

export default function Header({ 
  onToggleSidebar, 
  dataPanelOpened, 
  onToggleDataPanel 
}) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { map, mapStyle, changeMapStyle,} = useMap();
  const isDark = colorScheme === 'dark';

  const mapStyles = [
    { value: 'mapbox://styles/mapbox/light-v11', label: 'Light' },
    { value: 'mapbox://styles/mapbox/dark-v11', label: 'Dark' },
    { value: 'mapbox://styles/mapbox/streets-v12', label: 'Streets' },
    { value: 'mapbox://styles/mapbox/satellite-v9', label: 'Satellite' },
    { value: 'mapbox://styles/mapbox/satellite-streets-v12', label: 'Satellite Streets' },
  ];

  return (
    <Group
     
      h="100%" 
      px="md" 
      justify="space-between" 
      style={{ 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        backgroundColor: 'var(--mantine-color-body)',
        transition: 'all 0.2s ease'
      }}
    >
      <Group>
        <ActionIcon 
          variant="subtle" 
          color="gray" 
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu2 size={18} />
        </ActionIcon>
        <Title order={3} size="h4">Fiber Optic Dashboard</Title>
      </Group>

      <Group>
        <div
          style={{
            width: searchFocused ? rem(300) : rem(200),
            transition: 'width 0.2s ease',
            position: 'relative',
          }}
        >
          <SearchBox
            accessToken={accessToken}
            map={map}
            mapboxgl={mapboxgl}
            value={inputValue}
            onChange={(d) => setInputValue(d)}
            placeholder="Search places..."
            marker
            options={{
              proximity: [-71.113350, 42.039436], // Bias results near initial map center
            }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--mantine-color-gray-6)',
              pointerEvents: 'none',
            }}
            
          />
        </div>

        <Select
          size="xs"
          value={mapStyle}
          onChange={changeMapStyle}
          data={mapStyles}
          style={{ width: 150 }}
          leftSection={<Map size={14} />}
          placeholder="Select map style"
        />

        <Tooltip label="Toggle data table">
          <ActionIcon 
            variant={dataPanelOpened ? "filled" : "subtle"} 
            color="blue" 
            onClick={onToggleDataPanel}
            aria-label="Toggle data table"
          >
            <Table size={18} />
          </ActionIcon>
        </Tooltip>

        <Menu shadow="md" width={200} position="bottom-end" transitionProps={{ transition: 'rotate-right', duration: 150 }} >
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" aria-label="Options">
              <Layers size={18} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Map Options</Menu.Label>
            <Menu.Item leftSection={<Layers size={14} />}>
              Base Layer
            </Menu.Item>
            
            <Menu.Item leftSection={<Layers size={14} />}>
              Toggle Layers
            </Menu.Item>
            <Divider />
            <Menu.Label>Export</Menu.Label>
            <Menu.Item leftSection={<Download size={14} />}>
              Download Data
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Tooltip label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle color scheme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
}