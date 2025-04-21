import React, { useState } from 'react';
import CoordinateInput from './CoordinateInput';
import StatusCard from './StatusCard';
import { motion } from 'framer-motion';

export default function ControlPanel({ isMobile }) {
  const [coords, setCoords] = useState({ x: 0, y: 0, z: 0, effector: 45 });
  const [status, setStatus] = useState('Ready');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCoordChange = (name, value) => {
    setCoords(prev => ({ ...prev, [name]: value }));
  };

  const sendCoords = () => {
    setLoading(true);
    setStatus(`Sending coordinates to robot...`);
    setError(null);
  
    if (coords.effector < 0 || coords.effector > 90) {
      setStatus("⚠️ Invalid effector angle (must be 0–90)");
      setError("Effector angle must be between 0 and 90.");
      setLoading(false);
      return;
    }
  
    // 🔁 Swap X and Y before sending
    const swappedToFirmware = {
      x: coords.y,
      y: coords.x,
      z: coords.z,
      effector: coords.effector,
    };
  
    fetch('/api/move-arm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(swappedToFirmware),
    })
      .then(res => res.json())
      .then(data => {
        if (data.type === "update") {
          // 🔁 Swap back for user display
          const { x, y, z } = data.data;
          setStatus(`✅ Arm moved to (${y}, ${x}, ${z})`);
        } else if (data.type === "bounds") {
          setStatus("⚠️ OUT OF BOUNDS!!!");
          setError(data.data?.message || "Out of bounds.");
        } else {
          setStatus("⚠️ Unknown response.");
        }
      })
      .catch(err => {
        setStatus('❌ Network or server error.');
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  

  return (
    <motion.div 
      className="bg-gradient-to-t from-black to-blue-950/90 border border-blue-500/30 shadow-2xl rounded-lg p-4 md:p-6 space-y-4 md:space-y-6 font-display"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 tracking-wide text-center">
        Manual Control
      </h2>

      <StatusCard status={status} error={error} />

      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
        <CoordinateInput label="X" name="x" value={coords.x} onChange={handleCoordChange} disabled={loading} />
        <CoordinateInput label="Y" name="y" value={coords.y} onChange={handleCoordChange} disabled={loading} />
        <CoordinateInput label="Z" name="z" value={coords.z} onChange={handleCoordChange} disabled={loading} />
        <CoordinateInput
          label="End Effector (0–90)"
          name="effector"
          value={coords.effector}
          onChange={handleCoordChange}
          disabled={loading}
        />
      </div>

      <motion.button
        onClick={sendCoords}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 shadow-lg shadow-blue-900/50 hover:shadow-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] disabled:shadow-none"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? 'Sending...' : 'Send Coordinates'}
      </motion.button>
    </motion.div>
  );
}
