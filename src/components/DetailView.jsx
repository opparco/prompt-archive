// src/components/DetailView.jsx
import React from 'react';
import { parseMetadataString } from '../services/metadataService';

const DetailView = ({ image, onClose }) => {
  const metadata = parseMetadataString(image.metadata);
  
  // Group metadata into categories for better organization
  const getGroupedMetadata = () => {
    const groups = {
      'Generation Settings': ['Steps', 'Sampler', 'CFG scale', 'Seed', 'Size'],
      'Model Information': ['Model', 'Model hash'],
      'Prompt Information': ['Prompt', 'Negative prompt'],
      'Other': []
    };
    
    const grouped = {
      'Generation Settings': {},
      'Model Information': {},
      'Prompt Information': {},
      'Other': {}
    };
    
    // Distribute metadata into groups
    Object.entries(metadata).forEach(([key, value]) => {
      let placed = false;
      
      for (const [groupName, fields] of Object.entries(groups)) {
        if (fields.includes(key)) {
          grouped[groupName][key] = value;
          placed = true;
          break;
        }
      }
      
      if (!placed) {
        grouped['Other'][key] = value;
      }
    });
    
    return grouped;
  };
  
  const groupedMetadata = getGroupedMetadata();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Image Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-y-auto max-h-[calc(90vh-4rem)]">
          <div className="md:col-span-1">
            <img 
              src={`/images${image.imagePath}`} 
              alt="Detailed view"
              className="w-full rounded shadow-md object-contain max-h-[60vh]"
            />
          </div>
          
          <div className="md:col-span-1 space-y-4">
            {Object.entries(groupedMetadata).map(([groupName, fields]) => {
              // Skip empty groups
              if (Object.keys(fields).length === 0) return null;
              
              return (
                <div key={groupName} className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-2">{groupName}</h3>
                  <div className="space-y-2">
                    {Object.entries(fields).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-3 gap-2">
                        <span className="text-gray-600 font-medium col-span-1">{key}:</span>
                        <div className="text-gray-800 col-span-2 break-words">
                          {key.toLowerCase().includes('prompt') ? (
                            <div className="bg-gray-50 p-2 rounded text-sm">{value}</div>
                          ) : (
                            value
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailView;
