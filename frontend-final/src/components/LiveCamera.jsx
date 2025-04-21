import { motion } from "framer-motion"

export default function LiveCamera({ isMobile }) {
  return (
    <motion.div 
      className="bg-gradient-to-t from-black to-blue-950/90 border border-blue-500/30 shadow-2xl rounded-lg p-4 md:p-6 space-y-4 font-display"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 tracking-wide text-center">
        Live Camera Feed
      </h2>
      
      <motion.div 
        className="relative aspect-video w-full overflow-hidden rounded-lg border border-blue-500/30 shadow-inner"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <img 
          src="/video-feed" 
          alt="Live camera feed" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        <div className="absolute bottom-2 left-2 text-sm text-white/80 font-medium bg-black/50 px-2 py-1 rounded">
          Camera 1
        </div>
      </motion.div>
    </motion.div>
  )
}

