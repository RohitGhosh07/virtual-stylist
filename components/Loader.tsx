import React from 'react';

export const Loader: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`flex flex-col items-center gap-2`}>
      <div className={`${sizeClasses[size]} relative animate-spin`}>
        <div className="absolute inset-0 border-4 border-black border-t-[#ccff00] border-r-[#ff00ff] border-b-black border-l-black"></div>
      </div>
    </div>
  );
};