import React from 'react';
import { PrimaryButton } from '@/components/common';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-3xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-lg text-gray-600 max-w-lg mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4">
        <PrimaryButton
          onClick={() => router.push('/')}
          title="Go to Home"
          className="px-6 py-2"
        />
        <PrimaryButton
          onClick={() => router.back()}
          title="Go Back"
          className="px-6 py-2"
        />
      </div>
    </div>
  );
} 