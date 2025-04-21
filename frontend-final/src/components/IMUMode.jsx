"use client"
import { motion } from "framer-motion"

export default function IMUMode() {
  return (
    <motion.div
      className="p-6 rounded-lg bg-gradient-to-b from-green-900/30 to-black border border-green-500/30 shadow-lg shadow-green-900/20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-center space-x-3">
        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-md shadow-green-500/50"></div>
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
          IMU Mode Active
        </h2>
      </div>
    </motion.div>
  )
}

