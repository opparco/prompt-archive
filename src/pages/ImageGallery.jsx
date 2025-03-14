import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ImageGrid from '../components/ImageGrid';
import DetailView from '../components/DetailView';
import { useMetadata } from '../context/MetadataContext';

const ImageGallery = () => {
  const { filteredImages } = useMetadata();
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Image Gallery</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>
      
      <SearchBar />
      
      {showFilters && <FilterPanel />}
      
      <div className="mb-4">
        <p className="text-gray-600">{filteredImages.length} images found</p>
      </div>
      
      <ImageGrid onImageClick={(image) => setSelectedImage(image)} />
      
      {selectedImage && (
        <DetailView 
          image={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  );
};

export default ImageGallery;
