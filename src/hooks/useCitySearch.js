import { useState, useEffect, useCallback } from 'react';

// Chave e Host da API a partir das variáveis de ambiente
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = import.meta.env.VITE_RAPIDAPI_HOST;

export const useCitySearch = (searchTerm) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCities = useCallback(async (namePrefix) => {
    if (namePrefix.length < 3) { 
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?minPopulation=10000&namePrefix=${namePrefix}&languageCode=pt`;
    
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error('Falha ao buscar cidades.');
      }
      const result = await response.json();
      const formattedSuggestions = result.data.map(city => ({
        id: city.id,
        name: city.city,
        country: city.country,
        region: city.region,
      }));
      setSuggestions(formattedSuggestions);
    } catch (err) {
      setError(err.message);
      setSuggestions([]); 
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (!searchTerm) {
        setSuggestions([]);
        return;
    }

    const debounceTimer = setTimeout(() => {
      fetchCities(searchTerm);
    }, 500); 

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, fetchCities]);

  return { suggestions, isLoading, error, setSuggestions };
};