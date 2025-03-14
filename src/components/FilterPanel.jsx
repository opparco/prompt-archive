import React, { useState, useEffect } from 'react';
import { useMetadata } from '../context/MetadataContext';

const FilterPanel = () => {
  const { images, setSearchTerm } = useMetadata();
  const [modelFilters, setModelFilters] = useState([]);
  const [samplerFilters, setSamplerFilters] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [selectedSamplers, setSelectedSamplers] = useState([]);
  
  // Extract unique models and samplers from metadata
  useEffect(() => {
    const models = new Set();
    const samplers = new Set();
    
    images.forEach(image => {
      const metadata = parseMetadataString(image.metadata);
      if (metadata.Model) models.add(metadata.Model);
      if (metadata.Sampler) samplers.add(metadata.Sampler);
    });
    
    setModelFilters(Array.from(models));
    setSamplerFilters(Array.from(samplers));
  }, [images]);
  
  // Apply filters
  const applyFilters = () => {
    const filters = [];
    
    if (selectedModels.length > 0) {
      const modelQuery = selectedModels.join(' OR ');
      filters.push(`(${modelQuery})`);
    }
    
    if (selectedSamplers.length > 0) {
      const samplerQuery = selectedSamplers.join(' OR ');
      filters.push(`(${samplerQuery})`);
    }
    
    setSearchTerm(filters.join(' AND '));
  };
  
  // Reset filters
  const resetFilters = () => {
    setSelectedModels([]);
    setSelectedSamplers([]);
    setSearchTerm('');
  };
  
  // Toggle model selection
  const toggleModel = (model) => {
    setSelectedModels(prev => 
      prev.includes(model)
        ? prev.filter(m => m !== model)
        : [...prev, model]
    );
  };
  
  // Toggle sampler selection
  const toggleSampler = (sampler) => {
    setSelectedSamplers(prev => 
      prev.includes(sampler)
        ? prev.filter(s => s !== sampler)
        : [...prev, sampler]
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-medium mb-4">Filter Options</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Models filter */}
        <div>
          <h3 className="font-medium mb-2">Models:</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {modelFilters.map(model => (
              <label key={model} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedModels.includes(model)}
                  onChange={() => toggleModel(model)}
                  className="mr-2"
                />
                <span>{model}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Samplers filter */}
        <div>
          <h3 className="font-medium mb-2">Samplers:</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {samplerFilters.map(sampler => (
              <label key={sampler} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedSamplers.includes(sampler)}
                  onChange={() => toggleSampler(sampler)}
                  className="mr-2"
                />
                <span>{sampler}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={resetFilters}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Reset
        </button>
        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;

// Helper function for parsing metadata
const parseMetadataString = (metadataString) => {
  if (!metadataString) return {};
  
  const result = {};
  
  // Split by commas that are not within quotes
  const parts = metadataString.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
  
  parts.forEach(part => {
    const colonIndex = part.indexOf(':');
    if (colonIndex > 0) {
      const key = part.substring(0, colonIndex).trim();
      const value = part.substring(colonIndex + 1).trim();
      
      // Remove quotes if present
      const cleanValue = value.startsWith('"') && value.endsWith('"') 
        ? value.substring(1, value.length - 1) 
        : value;
      
      result[key] = cleanValue;
    }
  });
  
  return result;
};
