import React from 'react';

const Loader = ({ 
  size = 'md', 
  color = 'blue', 
  showText = true, 
  text = '読み込み中...',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    gray: 'border-gray-800'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-t-2 border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`}></div>
      {showText && <p className="text-gray-600 mt-4">{text}</p>}
    </div>
  );
};

export default Loader;
