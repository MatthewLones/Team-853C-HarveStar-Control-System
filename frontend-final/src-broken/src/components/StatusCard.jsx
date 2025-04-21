import React from 'react';

export default function StatusCard({ status, error }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow-sm">
      <p className="text-sm font-medium">
        Status: <span className="font-semibold">{status}</span>
      </p>
      {error && (
        <p className="text-red-500 text-sm mt-1">
          Error: {error}
        </p>
      )}
    </div>
  );
}
