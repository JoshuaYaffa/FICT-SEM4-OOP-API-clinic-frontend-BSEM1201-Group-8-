import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md', fullScreen = false, text = 'Loading...' }) => {
  const sizes = {
    sm: {
      container: 'w-8 h-8',
      border: 'border-2',
      text: 'text-sm'
    },
    md: {
      container: 'w-12 h-12',
      border: 'border-4',
      text: 'text-base'
    },
    lg: {
      container: 'w-16 h-16',
      border: 'border-4',
      text: 'text-lg'
    },
    xl: {
      container: 'w-24 h-24',
      border: 'border-4',
      text: 'text-xl'
    }
  };

  const sizeConfig = sizes[size] || sizes.md;

  const SpinnerContent = () => (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <div 
          className={`
            ${sizeConfig.container} 
            ${sizeConfig.border} 
            border-cyan-200 
            rounded-full 
            animate-spin
          `}
          style={{ borderTopColor: 'transparent' }}
        />
        <div 
          className={`
            absolute 
            inset-0 
            ${sizeConfig.container} 
            ${sizeConfig.border} 
            border-cyan-600 
            rounded-full 
            animate-pulse-custom
            opacity-20
          `}
        />
      </div>
      
      {text && (
        <p className={`mt-4 text-gray-600 ${sizeConfig.text} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
        <SpinnerContent />
      </div>
    );
  }

  return <SpinnerContent />;
};

// Inline Spinner for buttons
export const InlineSpinner = ({ size = 'sm' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  return (
    <div className="inline-flex items-center">
      <div 
        className={`
          ${sizes[size]} 
          border-2 
          border-cyan-600 
          border-t-transparent 
          rounded-full 
          animate-spin
        `}
      />
    </div>
  );
};

// Skeleton Loader for content placeholders
export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const skeletons = {
    card: (
      <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
    ),
    list: (
      <div className="flex items-center space-x-4 p-4 animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ),
    text: (
      <div className="space-y-2 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    )
  };

  const skeletonElement = skeletons[type] || skeletons.card;

  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i}>{skeletonElement}</div>
      ))}
    </div>
  );
};

// Dot Loader (chat style)
export const DotLoader = () => {
  return (
    <div className="flex space-x-1 items-center justify-center">
      <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce-custom" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce-custom" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce-custom" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
};

export default LoadingSpinner;