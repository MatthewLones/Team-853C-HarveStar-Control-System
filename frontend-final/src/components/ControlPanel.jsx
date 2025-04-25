import React, { useState } from 'react';
import CoordinateInput from './CoordinateInput';
import StatusCard from './StatusCard';
import { motion } from 'framer-motion';

export default function ControlPanel({ isMobile }) {
  const [coords, setCoords] = useState({ x: 0, y: 0, z: 0, effector: 45 });
  const [status, setStatus] = useState('Ready');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const handleCoordChange = (name, value) => {
    setCoords(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error when coordinates change
  };

  const validateCoordinates = () => {
    const { x, y, z, effector } = coords;
    
    // Check for NaN or invalid numbers
    if (isNaN(x) || isNaN(y) || isNaN(z) || isNaN(effector)) {
      setError("All coordinates must be valid numbers");
      return false;
    }

    // Check effector angle range
    if (effector < 0 || effector > 90) {
      setError("Effector angle must be between 0 and 90 degrees");
      return false;
    }

    // Check coordinate ranges (adjust these values based on your arm's limits)
    if (x < -30 || x > 30) {
      setError("X coordinate out of range (-30 to 30)");
      return false;
    }
    if (y < 0 || y > 40) {
      setError("Y coordinate out of range (0 to 40)");
      return false;
    }
    if (z < 0 || z > 20) {
      setError("Z coordinate out of range (0 to 20)");
      return false;
    }

    return true;
  };

  const sendCoords = async () => {
    if (!validateCoordinates()) {
      return;
    }

    setLoading(true);
    setStatus("Sending coordinates to robot...");
    setError(null);

    try {
      // Swap X and Y before sending
      const swappedToFirmware = {
        x: coords.y,
        y: coords.x,
        z: coords.z,
        effector: coords.effector,
      };

      const response = await fetch('/api/move-arm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(swappedToFirmware),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.type === "update") {
        const { x, y, z } = data.data;
        setStatus(`✅ Arm moved to (${y}, ${x}, ${z})`);
        setRetryCount(0); // Reset retry count on success
      } else if (data.type === "bounds") {
        setStatus("⚠️ OUT OF BOUNDS!!!");
        setError(data.data?.message || "Out of bounds.");
      } else if (data.type === "error") {
        setStatus("❌ Error from robot");
        setError(data.message || "Unknown error occurred");
      } else {
        setStatus("⚠️ Unknown response from robot");
        setError("Received unexpected response format");
      }
    } catch (err) {
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setStatus(`Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(sendCoords, 1000); // Retry after 1 second
      } else {
        setStatus('❌ Failed to communicate with robot');
        setError(err.message || "Network or server error");
        setRetryCount(0); // Reset retry count
      }
    } finally {
      if (retryCount === 0) { // Only set loading to false if not retrying
        setLoading(false);
      }
    }
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
        <CoordinateInput 
          label="X (-30 to 30)" 
          name="x" 
          value={coords.x} 
          onChange={handleCoordChange} 
          disabled={loading} 
        />
        <CoordinateInput 
          label="Y (0 to 40)" 
          name="y" 
          value={coords.y} 
          onChange={handleCoordChange} 
          disabled={loading} 
        />
        <CoordinateInput 
          label="Z (0 to 20)" 
          name="z" 
          value={coords.z} 
          onChange={handleCoordChange} 
          disabled={loading} 
        />
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
        {loading ? (retryCount > 0 ? `Retrying... (${retryCount}/${MAX_RETRIES})` : 'Sending...') : 'Send Coordinates'}
      </motion.button>
    </motion.div>
  );
}
