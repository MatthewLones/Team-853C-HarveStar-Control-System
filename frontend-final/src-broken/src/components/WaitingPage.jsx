import React from 'react';

export default function WaitingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white transition">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Waiting for HarveStar...</h1>
        <p className="text-sm text-gray-500">Press the button on the HarveStar to begin.</p>
        <div className="w-16 h-16 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
