export default function StatusCard({ status, error }) {
  return (
    <div className="bg-blue-950/80 border border-blue-500/30 rounded-lg p-4 text-blue-100 shadow-inner">
      <h2 className="font-bold text-base mb-2 text-cyan-300">🛰️ Status</h2>
      <p className="font-bold">{status}</p>
      {error && <p className="text-red-400 mt-2 font-bold">⚠️ {error}</p>}
    </div>
  )
}

