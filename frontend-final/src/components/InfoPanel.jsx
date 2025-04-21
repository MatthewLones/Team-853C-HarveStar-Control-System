export default function InfoPanel() {
  return (
    <div className="bg-gradient-to-t from-black to-blue-950/90 border border-blue-500/30 shadow-2xl rounded-lg p-4 md:p-6 space-y-4 md:space-y-6 font-display">
      <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 tracking-wide text-center">
        CASEE HarveStar
      </h2>
      
      <div className="flex justify-center">
        <img
          src="/csa.png"
          alt="CSA Logo"
          className="w-48 h-48 object-contain rounded-lg"
        />
      </div>

      <div className="space-y-4 text-blue-100">
        <div>
          <p className="font-bold text-cyan-300">🎯 Objective</p>
          <p className="ml-5">Pick up and transport 3D printed plants</p>
        </div>

        <div>
          <p className="font-bold text-cyan-300">🔧 Operating Modes</p>
          <ol className="ml-5 space-y-2">
            <li>1. Move to and from pre-determined locations</li>
            <li>2. Set specific coordinates</li>
            <li>3. IMU movement with a joystick</li>
          </ol>
        </div>

        <div className="mt-6 pt-4 border-t border-blue-500/30">
          <p className="text-sm text-cyan-300">✨ APSC 103 2024/2025</p>
          <p className="text-sm">Team 853-C</p>
          <div className="mt-2 text-sm text-blue-300/80">
            <p className="font-bold mb-1">Authors:</p>
            <p className="ml-2">
              Amanda Clayman • Avangelina Cvetan<br />
              Farbod Zandi • Kaitlyn Roberts<br />
              Luke Chipman • Matthew Lones
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
