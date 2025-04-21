#!/bin/bash

echo "💥 Killing all HarveStar processes..."

# Gracefully stop npm (simulate Ctrl+C)
echo "⏹ Attempting to gracefully stop npm..."
pgrep -f "npm start" | while read pid; do
    echo "→ Sending SIGINT to npm process $pid"
    kill -INT "$pid"
    sleep 2
done

# If still running, force kill npm
if pgrep -f "npm start" > /dev/null; then
    echo "⚠️ npm didn't exit. Forcing kill..."
    pkill -f "npm start"
fi

# Kill react-app-rewired, vite, and node (fallbacks)
pkill -f "react-app-rewired"
pkill -f "vite"
pkill -f "node"

# Kill Flask backend
echo "🧠 Killing Flask (python app.py)..."
pkill -f "python app.py"

# Kill cloudflared tunnels (if active)
echo "📡 Killing cloudflared tunnels..."
pkill -f "cloudflared tunnel"

# Free port 3000 in case it's still stuck
echo "🧹 Checking for lingering usage of port 3000..."
lsof -ti :3000 | xargs -r kill -9

# Optional: Free port 5050 too (Flask)
echo "🧹 Checking for lingering usage of port 5050..."
lsof -ti :5050 | xargs -r kill -9

# Close Terminal windows (macOS only)
echo "🪟 Attempting to close HarveStar-related Terminal windows..."
osascript <<EOF
tell application "Terminal"
    repeat with w in windows
        try
            repeat with t in tabs of w
                if contents of t contains "npm start" or contents of t contains "app.py" then
                    close w
                    exit repeat
                end if
            end repeat
        end try
    end repeat
end tell
EOF

echo "✅ All HarveStar-related processes and ports cleaned up."
