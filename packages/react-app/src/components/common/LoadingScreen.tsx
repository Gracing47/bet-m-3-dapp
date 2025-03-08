import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex flex-col items-center justify-center">
      <div className="p-6 rounded-lg text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
}

export default LoadingScreen; 