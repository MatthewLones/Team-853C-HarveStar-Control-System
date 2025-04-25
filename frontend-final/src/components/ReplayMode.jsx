"use client"

import { useState, useEffect, useRef } from "react"

const REPLAY_OPTIONS = [
  { id: 0, name: "Harvest the Plant" },
  { id: 1, name: "Draw a Circle" },
  { id: 2, name: "Wave Hello" },
]

export default function ReplayMode({ isMobile }) {
  const [selectedId, setSelectedId] = useState(null)
  const [status, setStatus] = useState("Idle")
  const [messages, setMessages] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [error, setError] = useState(null)
  const scrollRef = useRef(null)
  const [latestCoord, setLatestCoord] = useState(null)
  const [coordHistory, setCoordHistory] = useState([])
  const gridRef = useRef(null)

  const startReplay = async () => {
    if (selectedId === null) {
      setError("Please select a replay sequence");
      return;
    }

    setStatus("Sending replay request...");
    setMessages([]);
    setCoordHistory([]);
    setLatestCoord(null);
    setError(null);
    setIsRunning(true);
    setStartTime(Date.now());

    try {
      const response = await fetch("/api/start-replay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: selectedId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setStatus("Replay started!");
      } else {
        throw new Error(data.error || "Failed to start replay");
      }
    } catch (err) {
      setStatus("❌ Failed to start replay");
      setError(err.message);
      setIsRunning(false);
    }
  }

  const clearLog = () => {
    setMessages([]);
    setCoordHistory([]);
    setError(null);
  }

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/replay-status");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.messages) {
          setMessages(prev => [
            ...prev,
            ...data.messages.map(msg => ({
              ...msg,
              timestamp: ((Date.now() - startTime) / 1000).toFixed(2) + "s",
            })),
          ]);

          // Find coordinate updates
          const lastUpdate = data.messages.reverse().find((m) => m.type === "position");
          if (lastUpdate && lastUpdate.data) {
            const [y, x, z] = lastUpdate.data; // Swap x and y, ignore effector
            const newCoord = {
              x,
              y,
              z,
              time: Date.now(),
            };
            setLatestCoord(newCoord);
            setCoordHistory((prev) => [...prev, newCoord]);
          }
        }

        if (data.done) {
          setStatus("✅ Replay complete");
          setIsRunning(false);
          clearInterval(interval);
        }
      } catch (err) {
        setStatus("❌ Error polling status");
        setError(err.message);
        setIsRunning(false);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Clean up old coordinate history points
  useEffect(() => {
    if (coordHistory.length > 10) {
      const now = Date.now()
      setCoordHistory((prev) => prev.filter((coord) => now - coord.time < 3000))
    }
  }, [coordHistory]);

  // Convert grid coordinates to pixel positions
  const coordToPixel = (x, y) => {
    // Map x from [-30, 30] to [0, 100%] of grid width
    // Map y from [0, 40] to [100%, 0] of grid height (inverted y-axis)

    if (!gridRef.current) return { x: 0, y: 0 }

    const gridWidth = gridRef.current.clientWidth
    const gridHeight = gridRef.current.clientHeight

    // Convert x from [-30, 30] to [0, 1] then to pixels
    const normalizedX = (x + 30) / 60
    const pixelX = normalizedX * gridWidth

    // Convert y from [0, 40] to [1, 0] then to pixels (inverted)
    const normalizedY = 1 - y / 40
    const pixelY = normalizedY * gridHeight

    return { x: pixelX, y: pixelY }
  }

  // Debug function to log coordinates
  const logCoordinates = () => {
    console.log("Latest coord:", latestCoord);
    console.log("Coord history:", coordHistory);
    if (latestCoord) {
      const pos = coordToPixel(latestCoord.x, latestCoord.y);
      console.log("Pixel position:", pos);
    }
  }

  // Call logCoordinates when coordinates change
  useEffect(() => {
    logCoordinates();
  }, [latestCoord, coordHistory]);

  return (
    <div className="bg-gradient-to-t from-black to-blue-950/90 border border-blue-500/30 shadow-2xl rounded-lg p-4 md:p-6 space-y-4 md:space-y-6 font-display">
      <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 tracking-wide text-center">
        Replay Mode
      </h2>

      {error && (
        <div className="bg-red-900/50 border border-red-500/30 rounded-lg p-3 text-red-200">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {REPLAY_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              setSelectedId(option.id);
              setError(null);
            }}
            className={`block w-full text-left px-4 py-3 rounded-lg transition shadow-md border text-sm font-bold
              ${
                selectedId === option.id
                  ? "bg-gradient-to-r from-blue-800 to-blue-900 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  : "bg-blue-950/80 hover:bg-blue-900/60 border-blue-500/20 hover:border-blue-500/40"
              }`}
            disabled={isRunning}
          >
            {option.name}
          </button>
        ))}
      </div>

      <button
        onClick={startReplay}
        disabled={selectedId === null || isRunning}
        className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 shadow-lg shadow-green-900/50 hover:shadow-green-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] disabled:shadow-none"
      >
        {isRunning ? "Running..." : "Start Replay"}
      </button>

      <button
        onClick={clearLog}
        className="w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white py-2 px-2 mt-2 rounded-lg shadow-md shadow-red-900/50 hover:shadow-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] font-bold"
        disabled={messages.length === 0}
      >
        Clear Log
      </button>

      <div
        className="mt-4 p-3 md:p-4 bg-black/80 rounded-lg text-sm max-h-48 md:max-h-64 overflow-y-auto border border-blue-500/30 shadow-inner"
        ref={scrollRef}
      >
        <p className="font-bold text-cyan-300 mb-2">Replay Status:</p>
        <ul className="space-y-1 text-blue-100">
          {messages.map((msg, i) => {
            if (msg.type === "position" && msg.data) {
              const [y, x, z] = msg.data;
              return (
                <li key={i} className="flex items-center space-x-2">
                  <span className="text-gray-400">🕒</span>
                  <span className="text-cyan-200">{msg.timestamp}</span>
                  <span className="text-gray-400">➤</span>
                  <span className="text-green-300 font-mono">
                    x: {x.toFixed(1)}, y: {y.toFixed(1)}, z: {z.toFixed(1)}
                  </span>
                </li>
              );
            }
            
            if (msg.type === "bounds") {
              return (
                <li key={i} className="text-yellow-300 flex items-center space-x-2">
                  <span className="text-gray-400">🕒</span>
                  <span className="text-cyan-200">{msg.timestamp}</span>
                  <span className="text-yellow-300">⚠️ Out of bounds!</span>
                </li>
              );
            }
            
            if (msg.type === "done") {
              return (
                <li key={i} className="text-green-400 font-semibold flex items-center space-x-2">
                  <span className="text-gray-400">🕒</span>
                  <span className="text-cyan-200">{msg.timestamp}</span>
                  <span className="text-green-400">✅ Replay Complete</span>
                </li>
              );
            }
            
            if (msg.type === "error") {
              return (
                <li key={i} className="text-red-400 flex items-center space-x-2">
                  <span className="text-gray-400">🕒</span>
                  <span className="text-cyan-200">{msg.timestamp}</span>
                  <span className="text-red-400">❌ Error: {msg.message}</span>
                </li>
              );
            }
            
            return null;
          })}
        </ul>
        <p className="mt-2 italic text-xs text-cyan-300">Status: {status}</p>
      </div>

      <div className="mt-4 bg-black/80 p-3 md:p-4 rounded-lg shadow-xl relative border border-blue-500/30">
        <p className="font-bold text-sm text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
          Live Position Grid (x vs y in cm)
        </p>
        <div
          ref={gridRef}
          className="relative w-full h-48 md:h-80 border border-blue-400/30 bg-gradient-to-b from-blue-950/90 to-black overflow-hidden rounded-md shadow-inner"
        >
          {/* Grid lines */}
          <div className="absolute inset-0">
            {/* Horizontal grid lines (y-axis) */}
            {Array.from({ length: 21 }, (_, i) => (
              <div
                key={`h-${i}`}
                className={`absolute w-full border-t ${i % 5 === 0 ? "border-blue-400/40" : "border-blue-400/20"}`}
                style={{
                  top: `${(i / 20) * 100}%`,
                }}
              >
                {i % 5 === 0 && (
                  <span className="absolute -left-7 -translate-y-1/2 text-xs text-blue-300/70 font-bold">
                    {40 - i * 2}
                  </span>
                )}
              </div>
            ))}

            {/* Vertical grid lines (x-axis) */}
            {Array.from({ length: 31 }, (_, i) => (
              <div
                key={`v-${i}`}
                className={`absolute h-full border-l ${i % 5 === 0 ? "border-blue-400/40" : "border-blue-400/20"}`}
                style={{
                  left: `${(i / 30) * 100}%`,
                }}
              >
                {i % 5 === 0 && (
                  <span className="absolute -bottom-5 -translate-x-1/2 text-xs text-blue-300/70 font-bold">
                    {-30 + i * 2}
                  </span>
                )}
              </div>
            ))}

            {/* Origin lines */}
            <div className="absolute left-0 top-0 h-full border-l border-blue-400/60" style={{ left: "50%" }}></div>
            <div className="absolute left-0 top-full w-full border-t border-blue-400/60"></div>
          </div>

          {/* Coordinate history trail */}
          {coordHistory.map((coord, index) => {
            const { x, y } = coordToPixel(coord.x, coord.y)
            return (
              <div
                key={`history-${coord.time}`}
                className="absolute w-2 h-2 rounded-full bg-green-500/30"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            )
          })}

          {/* Current position dot */}
          {latestCoord && (
            <div
              className="absolute w-4 h-4 rounded-full bg-green-400 shadow-lg shadow-green-500/50"
              style={{
                left: `${coordToPixel(latestCoord.x, latestCoord.y).x}px`,
                top: `${coordToPixel(latestCoord.x, latestCoord.y).y}px`,
                transform: 'translate(-50%, -50%)',
                filter: "drop-shadow(0 0 12px rgba(74, 222, 128, 0.9))",
              }}
            />
          )}

          {/* Axis labels */}
          <div className="absolute bottom-1 right-2 text-xs text-blue-300/70 font-bold">x-axis (cm)</div>
          <div className="absolute top-2 left-2 text-xs text-blue-300/70 font-bold">y-axis (cm)</div>
        </div>
      </div>
    </div>
  );
}

