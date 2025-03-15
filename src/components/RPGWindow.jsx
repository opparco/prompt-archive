import React from 'react';

const RPGWindow = ({ children, title, className = '', titleWidth = '200px' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* メインのコンテナ */}
      <div className="relative bg-gray-100 border-2 border-gray-800 rounded-lg p-6">
        {/* 点線 */}
        <div className="absolute inset-1 rounded border border-dashed border-gray-700 pointer-events-none"></div>
        
        {/* コンテンツ */}
        <div className="relative z-10 pt-2">
          {children}
        </div>
      </div>
      
      {/* タイトル */}
      {title && (
        <div className="absolute top-0 left-1/2 transform -translate-y-1/2 -translate-x-1/2 px-3 py-0 bg-gray-100 border-2 border-gray-800 rounded-md z-10"
          style={{ width: titleWidth, textAlign: 'center' }}
        >
          <span className="text-gray-800 font-bold text-lg whitespace-nowrap">
            {title}
          </span>
        </div>
      )}
    </div>
  );
};

export default RPGWindow;
