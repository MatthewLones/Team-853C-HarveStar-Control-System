import React, { useEffect, useState } from 'react';
import ControlPanel from './components/ControlPanel';
import WaitingPage from './components/WaitingPage';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  // const [robotReady, setRobotReady] = useState(false);
  // const [waiting, setWaiting] = useState(true);

  // Dark mode sync
  useEffect(() => {
    const root = document.documentElement;
    darkMode ? root.classList.add('dark') : root.classList.remove('dark');
  }, [darkMode]);

  // Arm ready check on load
  /*useEffect(() => {
    fetch('/api/arm-ready')
      .then(res => res.json())
      .then(data => {
        if (data.ready) {
          setRobotReady(true);
        } else {
          console.warn("Robot not ready:", data.error);
        }
      })
      .catch(err => {
        console.error("Error waiting for robot:", err.message);
      })
      .finally(() => {
        setWaiting(false);
      });
  }, []);*/

  // Show loading screen until arm is ready
  // if (!robotReady || waiting) return <WaitingPage />;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
        <h1 className="text-xl font-bold">Lunar Arm Control</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </header>

      <main className="p-6">
        <ControlPanel />
      </main>
    </div>
  );
}

export default App;
