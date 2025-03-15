import React from 'react';

const RPGButton = ({ onClick, children, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-6 py-2 text-md transition-all duration-200
        bg-gray-100 border-2 border-gray-800 rounded-md
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:bg-gray-200 active:bg-gray-300 cursor-pointer'}
      `}
    >
      {/* ボタンのテキスト */}
      <span className="relative z-10 text-gray-800 font-bold">
        {children}
      </span>
    </button>
  );
};

export default RPGButton;
