import React from 'react';

export default function CoordinateInput({ label, name, value, onChange, disabled }) {
  return (
    <label className="flex flex-col text-sm">
      {label}
      <input
        type="number"
        name={name}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(name, parseFloat(e.target.value))}
        className="mt-1 p-2 rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-50"
      />
    </label>
  );
}
