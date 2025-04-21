#!/bin/bash

echo "🚀 Launching HarveStar system..."

# Create log folder if it doesn't exist
mkdir -p logs

# Ensure Pico serial port is connected
echo "🔌 Waiting for Pico to mount (/dev/tty.usbmodem*)..."
while [ ! -e /dev/tty.usbmodem* ]; do
    sleep 1
done
echo "✅ Pico serial port detected."

# Launch Flask backend in current terminal with venv
echo "🔧 Starting Flask backend (with venv)..."
cd backend
source venv/bin/activate
python app.py | tee ../logs/backend.log &
BACKEND_PID=$!
cd ..

# Wait for backend to respond to /api/arm-ready
echo "⏳ Waiting for backend to be ready (API)..."
until curl --silent --fail http://localhost:5050/api/arm-ready; do
    sleep 1
done
echo "✅ Backend is ready."

# Launch React frontend in a new Terminal window
FRONTEND_PATH="$(pwd)/frontend-final"
osascript <<EOF
tell application "Terminal"
    do script "cd '$FRONTEND_PATH' && npm start | tee ../logs/frontend.log"
end tell
EOF


echo ""
echo "✅ All systems running."
echo "🧠 Flask PID: $BACKEND_PID"
echo "📄 Logs streaming to ./logs/"
echo "💥 To stop everything, run: ./kill_all.sh"