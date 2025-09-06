
import React from 'react';

interface SpinnerProps {
  fullPage?: boolean;
  text?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ fullPage = false, text }) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        {text && <p className="mt-4 text-lg font-medium text-blue-600">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      {text && <p className="ml-2 text-sm text-gray-600">{text}</p>}
    </div>
  );
};
