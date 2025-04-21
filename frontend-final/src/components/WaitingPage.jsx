"use client"
import { motion } from "framer-motion"

export default function WaitingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-black text-white transition">
      <motion.div
        className="text-center space-y-6 p-8 bg-black/60 rounded-xl border border-blue-500/30 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
          Waiting for HarveStar...
        </h1>
        <p className="text-sm text-blue-300">Press the button on the HarveStar to begin.</p>
        <div className="w-20 h-20 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
      </motion.div>
    </div>
  )
}

