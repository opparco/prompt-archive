import React, { createContext, useContext, useState, useEffect } from 'react';

// Sample data structure (later to be replaced with actual API call)
const sampleData = [
  {
    id: '1',
    imagePath: '/b/src/10000/10000.jpg',
    metadata: 'Steps: 20, Sampler: Euler a, CFG scale: 7, Seed: 1234567890, Size: 512x512, Model hash: abcdef123456, Model: stable_diffusion, Prompt: a beautiful landscape with mountains and lake, Negative prompt: bad quality, blurry'
  },
  {
    id: '2',
    imagePath: '/b/src/10001/10001.jpg',
    metadata: 'Steps: 25, Sampler: DPM++ 2M Karras, CFG scale: 8, Seed: 987654321, Size: 768x768, Model hash: 123abc456def, Model: deliberate_v2, Prompt: portrait of a woman with blue eyes, Negative prompt: deformed, ugly, bad anatomy'
  },
  // More sample items can be added here
];

// Create context
const MetadataContext = createContext();

export const useMetadata = () => useContext(MetadataContext);

export const MetadataProvider = ({ children }) => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API or local storage
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real application, you would fetch from your API
        // For now, use sample data
        setImages(sampleData);
        setFilteredImages(sampleData);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch metadata');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter images based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredImages(images);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = images.filter(item => 
      item.metadata.toLowerCase().includes(lowerCaseSearchTerm)
    );
    
    setFilteredImages(filtered);
  }, [searchTerm, images]);

  // Parse metadata string into structured object
  const parseMetadata = (metadataString) => {
    if (!metadataString) return {};
    
    const result = {};
    
    // Split by commas that are not within quotes
    const parts = metadataString.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
    
    parts.forEach(part => {
      const colonIndex = part.indexOf(':');
      if (colonIndex > 0) {
        const key = part.substring(0, colonIndex).trim();
        const value = part.substring(colonIndex + 1).trim();
        result[key] = value;
      }
    });
    
    return result;
  };

  const value = {
    images,
    filteredImages,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    parseMetadata
  };

  return (
    <MetadataContext.Provider value={value}>
      {children}
    </MetadataContext.Provider>
  );
};
