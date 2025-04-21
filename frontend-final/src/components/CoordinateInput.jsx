"use client"
import React from 'react';
import { motion } from 'framer-motion';

export default function CoordinateInput({ label, name, value, onChange, disabled }) {
  const handleChange = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(name, val);
    }
  };

  return (
    <motion.div 
      className="relative"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <label className="block text-sm font-medium text-blue-200 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="w-full bg-blue-950/80 border border-blue-500/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent disabled:opacity-50 transition-all duration-200"
          step="0.5"
        />
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
      </div>
    </motion.div>
  );
}

