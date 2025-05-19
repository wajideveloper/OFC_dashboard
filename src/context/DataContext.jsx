import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data with properties for all filters
  useEffect(() => {
    const mockData = [
      {
        id: 'FH-1001',
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-71.1125, 42.0405],
        },
        properties: {
          id: 'FH-1001',
          type: 'hydrant',
          street: 'Main St',
          date: '2019-05-12',
          condition: 'Good',
          material: 'Metal',
          lastInspection: '2023-02-15',
          price: 1500,
          neighborhood: 'Downtown',
          districts: ['Commercial'],
          year: '2019',
        },
      },
      {
        id: 'SL-2034',
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-71.1140, 42.0410],
        },
        properties: {
          id: 'SL-2034',
          type: 'light',
          street: 'Oak Rd',
          date: '2018-09-23',
          condition: 'Fair',
          material: 'Metal',
          lastInspection: '2022-11-05',
          price: 2500,
          neighborhood: 'North End',
          districts: ['Residential'],
          year: '2018',
        },
      },
      {
        id: 'TS-3045',
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-71.1165, 42.0385],
        },
        properties: {
          id: 'TS-3045',
          type: 'signal',
          street: 'Pine Ave',
          date: '2021-03-17',
          condition: 'Excellent',
          material: 'Composite',
          lastInspection: '2023-04-20',
          price: 3500,
          neighborhood: 'South End',
          districts: ['Commercial', 'Historic'],
          year: '2021',
        },
      },
      {
        id: 'UP-4056',
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-71.1100, 42.0420],
        },
        properties: {
          id: 'UP-4056',
          type: 'pole',
          street: 'Maple Ln',
          date: '2017-11-09',
          condition: 'Poor',
          material: 'Wood',
          lastInspection: '2022-08-30',
          price: 1000,
          neighborhood: 'West Side',
          districts: ['Residential'],
          year: '2017',
        },
      },
      {
        id: 'MH-5067',
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-71.1130, 42.0400],
        },
        properties: {
          id: 'MH-5067',
          type: 'manhole',
          street: 'Cedar Blvd',
          date: '2020-07-24',
          condition: 'Good',
          material: 'Concrete',
          lastInspection: '2023-01-12',
          price: 2000,
          neighborhood: 'East Side',
          districts: ['Industrial'],
          year: '2020',
        },
      },
    ];

    setData(mockData);
    setFilteredData(mockData);
  }, []);

  const filterData = useCallback((options) => {
    const {
      priceRange = [0, 5000],
      types = [],
      streetName = '',
      neighborhood = null,
      districts = [],
      material = null,
      condition = null,
      year = null,
    } = options;

    const newFilteredData = data.filter((item) => {
      const props = item.properties;
      const priceInRange = props.price >= priceRange[0] && props.price <= priceRange[1];
      const typeMatches = types.length === 0 || types.includes(props.type);
      const streetMatches = !streetName || props.street.toLowerCase().includes(streetName.toLowerCase());
      const neighborhoodMatches = !neighborhood || props.neighborhood === neighborhood;
      const districtMatches = districts.length === 0 || districts.some(d => props.districts.includes(d));
      const materialMatches = !material || props.material === material;
      const conditionMatches = !condition || props.condition === condition;
      const yearMatches = !year || props.year === year;

      return (
        priceInRange &&
        typeMatches &&
        streetMatches &&
        neighborhoodMatches &&
        districtMatches &&
        materialMatches &&
        conditionMatches &&
        yearMatches
      );
    });

    setFilteredData(newFilteredData);
  }, [data]);

  const resetFilters = useCallback(() => {
    setFilteredData(data);
  }, [data]);

  return (
    <DataContext.Provider
      value={{
        data,
        filteredData,
        loading,
        error,
        filterData,
        resetFilters,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}