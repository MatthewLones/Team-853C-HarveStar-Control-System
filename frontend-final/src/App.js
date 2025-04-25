/**
 * HarveStar Robotic Arm Control Interface
 * Main React application component for controlling the robotic arm.
 */

"use client"

import React, { useState, useEffect } from "react";
import ControlPanel from "./components/ControlPanel";
import ReplayMode from "./components/ReplayMode";
import IMUMode from "./components/IMUMode";
import InfoPanel from "./components/InfoPanel";
import ModeSwitcher from "./components/ModeSwitcher";
import LiveCamera from "./components/LiveCamera";
import WaitingPage from "./components/WaitingPage";
import "./index.css";

export default function App() {
  // State management
  const [activeMode, setActiveMode] = useState("manual");
  const [robotReady, setRobotReady] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Initialize dark mode and mobile detection
  useEffect(() => {
    document.documentElement.classList.add("dark");
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check robot readiness on initial load
  useEffect(() => {
    console.log("[App] Checking robot readiness...");
    fetch("/api/arm-ready")
      .then((res) => res.json())
      .then((data) => {
        if (data.ready) {
          console.log("[App] ✅ Robot is ready!");
          setRobotReady(true);
        } else {
          console.warn("[App] ❌ Robot not ready:", data.error);
        }
      })
      .catch((err) => {
        console.error("[App] Network error:", err.message);
      })
      .finally(() => {
        setWaiting(false);
      });
  }, []);

  // Show loading screen until robot is ready
  if (!robotReady || waiting) {
    return <WaitingPage />;
  }

  return (
    <div className="min-h-screen font-display bg-gradient-to-br from-blue-900/90 to-black/90 text-white backdrop-blur-md dark:bg-gray-950">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center px-4 md:px-6 py-3 md:py-4 bg-blue-900/80 backdrop-blur-xl shadow-lg border-b border-blue-500/30">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide text-blue-100 drop-shadow-sm text-center md:text-left mb-2 md:mb-0">
          🚀 CSA Team-853 HarveStar Control Room™
        </h1>
        <span className="text-xs md:text-sm text-blue-200 opacity-70">
          V1.0: Radish, Carrot and Tomatoe Capable!
        </span>
      </header>

      {/* Main Content Layout */}
      <div className="flex flex-col md:grid md:grid-cols-5 md:grid-rows-[1fr_auto] gap-4 p-4 md:p-6">
        {/* Left Info Panel - Desktop Only */}
        <div className="hidden md:block md:col-span-1">
          <InfoPanel />
        </div>

        {/* Center Control Panel */}
        <div className="md:col-span-3 mb-4 md:mb-0">
          {activeMode === "manual" && <ControlPanel isMobile={isMobile} />}
          {activeMode === "replay" && <ReplayMode isMobile={isMobile} />}
          {activeMode === "imu" && <IMUMode />}
        </div>

        {/* Right Mode Switcher */}
        <div className="md:col-span-1 mb-4 md:mb-0">
          <ModeSwitcher activeMode={activeMode} setActiveMode={setActiveMode} />
        </div>

        {/* Bottom Camera Feed */}
        <div className="md:col-span-5">
          <LiveCamera />
        </div>
      </div>
    </div>
  );
}

