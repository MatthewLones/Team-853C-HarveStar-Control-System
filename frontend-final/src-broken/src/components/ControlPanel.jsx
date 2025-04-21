import React, { useState } from 'react';
import CoordinateInput from './CoordinateInput';
import StatusCard from './StatusCard';

export default function ControlPanel() {
  const [coords, setCoords] = useState({ x: 0, y: 0, z: 0, effector: 45 });
  const [status, setStatus] = useState('Ready');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  // 🔧 Coordinate field handler
  const handleCoordChange = (name, value) => {
    setCoords(prev => ({ ...prev, [name]: value }));
  };

  // 🚀 Send to Flask backend
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

    fetch('/api/move-arm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coords)
    })
      .then(res => res.json())
      .then(data => {
        if (data.type === "update") {
          setStatus(`✅ Arm moved to (${data.data.x}, ${data.data.y}, ${data.data.z})`);
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
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Robot Arm Coordinate Control</h1>

      <StatusCard status={status} error={error} />

      <div className="grid grid-cols-2 gap-4">
        <CoordinateInput label="X" name="x" value={coords.x} onChange={handleCoordChange} disabled={loading} />
        <CoordinateInput label="Y" name="y" value={coords.y} onChange={handleCoordChange} disabled={loading} />
        <CoordinateInput label="Z" name="z" value={coords.z} onChange={handleCoordChange} disabled={loading} />
        <CoordinateInput label="End Effector (0–90)" name="effector" value={coords.effector} onChange={handleCoordChange} disabled={loading} />
      </div>

      <button
        onClick={sendCoords}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Coordinates'}
      </button>
    </div>
  );
}
