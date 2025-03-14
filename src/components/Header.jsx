import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900">PromptArchive</h1>
        <p className="text-gray-600 mt-1">Browse and search your image collection based on metadata</p>
      </div>
    </header>
  );
};

export default Header;
