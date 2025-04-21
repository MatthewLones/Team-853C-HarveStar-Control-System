"use client"
import { motion } from "framer-motion"

export default function ModeSwitcher({ activeMode, setActiveMode }) {
  const modes = [
    { id: "manual", label: "OVERIDE", color: "orange" },
    { id: "replay", label: "REPLAY", color: "blue" },
    { id: "imu", label: "LIVE CONTROL", color: "green" },
  ]

  const getButtonStyles = (mode) => {
    const isActive = activeMode === mode.id
    const baseClasses = "w-full px-4 py-3 rounded-lg text-xl transition border font-bold"

    if (isActive) {
      switch (mode.color) {
        case "orange":
          return `${baseClasses} bg-gradient-to-r from-orange-700 to-orange-900 text-white border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]`
        case "blue":
          return `${baseClasses} bg-gradient-to-r from-blue-700 to-blue-900 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]`
        case "green":
          return `${baseClasses} bg-gradient-to-r from-green-700 to-green-900 text-white border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]`
        default:
          return `${baseClasses}`
      }
    } else {
      switch (mode.color) {
        case "orange":
          return `${baseClasses} bg-black/60 hover:bg-orange-900/40 text-orange-200 border-orange-500/20 hover:border-orange-500/40`
        case "blue":
          return `${baseClasses} bg-black/60 hover:bg-blue-900/40 text-blue-200 border-blue-500/20 hover:border-blue-500/40`
        case "green":
          return `${baseClasses} bg-black/60 hover:bg-green-900/40 text-green-200 border-green-500/20 hover:border-green-500/40`
        default:
          return `${baseClasses}`
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {modes.map((mode) => (
        <motion.button
          key={mode.id}
          onClick={() => setActiveMode(mode.id)}
          className={getButtonStyles(mode)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {mode.label} {/* 🔁 This must be `mode.label` instead of `mode.id.toUpperCase()` */}
        </motion.button>
      ))}
    </div>
  )
}
