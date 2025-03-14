import React, { useState } from 'react';

const Settings = () => {
  const [basePath, setBasePath] = useState('/images');
  const [metadataPath, setMetadataPath] = useState('/metadata');
  const [thumbnailSize, setThumbnailSize] = useState('medium');
  const [theme, setTheme] = useState('light');
  
  const handleSave = () => {
    // In a real app, this would persist settings
    alert('Settings saved!');
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="basePath" className="block text-sm font-medium text-gray-700">
              Images Base Path
            </label>
            <input
              type="text"
              id="basePath"
              value={basePath}
              onChange={(e) => setBasePath(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Base directory where image files are located
            </p>
          </div>
          
          <div>
            <label htmlFor="metadataPath" className="block text-sm font-medium text-gray-700">
              Metadata Path
            </label>
            <input
              type="text"
              id="metadataPath"
              value={metadataPath}
              onChange={(e) => setMetadataPath(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Directory where metadata files are stored
            </p>
          </div>
          
          <div>
            <label htmlFor="thumbnailSize" className="block text-sm font-medium text-gray-700">
              Thumbnail Size
            </label>
            <select
              id="thumbnailSize"
              value={thumbnailSize}
              onChange={(e) => setThumbnailSize(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
              Theme
            </label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          
          <div>
            <button
              onClick={handleSave}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
