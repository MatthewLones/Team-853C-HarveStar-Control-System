from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
import cv2
from flask import Response
from arm_controller.armComms import ArmController

# === Define Replay Sequences ===
REPLAY_SEQUENCES = {
    0: [
        ([16.5, 20.5, 3.5, 45], 0.5),
        ([20, 24, 2.5, 45], 0.4),
        ([19, 23, 2.5, 40], 0.2),
        ([17, 23, 6, 45], 0.2),
        ([25.5, -16, 8, 45], 0.8),
        ([25.5, -16, 8, 90], 0.2),
        ([25.5, -16, 10, 90], 0.2),

        ([16.5, 20.5, 3.5, 45], 0.5),
        ([20, 24, 2.5, 45], 0.4),
        ([19, 23, 2.5, 35], 0.2),
        ([16, 22, 6, 45], 0.2),

        ([28.5, -12.5, 8, 45], 0.8),
        ([28.5, -12.5, 8, 90], 0.2),
        ([28.5, -12.5, 12, 90], 0.2),

        ([16.5, 20.5, 6, 45], 0.5),
        ([21, 25, 5.5, 45], 0.4),
        ([21, 25, 5.5, 50], 0.2),
        ([16, 21, 6, 45], 0.2),

        ([31.5, -9.5, 6, 45], 0.8),
        ([31.5, -9.5, 6, 90], 0.2),
        ([31.5, -9.5, 10, 90], 0.2),
        ([25, 0, 10, 90], 0.2)
    ]
}

"""REPLAY_SEQUENCES = {
    0: [
        ([28, -10, 15, 45], 0.2),
        ([28, 0, 10, 40], 0.2),
        ([28, 10, 15, 45], 0.2),
        ([28, 0, 10, 40], 0.2),
        ([28, -10, 15, 45], 0.2),
        ([28, 0, 10, 40], 0.2),
        ([28, 10, 15, 45], 0.2),
        ([28, 0, 15, 40], 0.2),
    ]
}"""


app = Flask(__name__)
CORS(app)

# Only run this in the main process (not the reloader)
harvestar = ArmController(port="/dev/tty.usbmodem101")


camera = cv2.VideoCapture(0)

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            print("[Flask] ❌ Failed to grab frame.")
            break
        else:
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video-feed')
def video_feed():
    print("[Flask] 🎥 Sending live video feed...")
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


arm_has_started = False

@app.route('/api/arm-ready', methods=['GET'])
def api_arm_ready():
    global arm_has_started

    if arm_has_started:
        print("[Flask] Arm already marked ready. Skipping wait.")
        return jsonify({ "ready": True })

    print("[Flask] Waiting for robot readiness...")
    start = time.time()
    timeout = 60

    while time.time() - start < timeout:
        print("[Flask] waiting for robot...")
        response = harvestar.listen()
        print("[Flask] Got from arm:", response)
        if response and response.get("type") == "ready":
            print("[Flask] Robot is ready!")
            arm_has_started = True
            return jsonify({ "ready": True })

    print("[Flask] Timeout waiting for robot.")
    return jsonify({ "ready": False, "error": "Timeout." }), 408



@app.route('/api/move-arm', methods=['POST'])
def move_arm():
    try:
        data = request.get_json()
        print(f"[Flask] Received coords: {data}")

        # Validate the structure
        if not isinstance(data, dict):
            raise ValueError("Invalid request format")
        if not all(k in data for k in ['x', 'y', 'z', 'effector']):
            raise ValueError("Missing coordinate keys")
        if not all(isinstance(data[k], (int, float)) for k in ['x', 'y', 'z', 'effector']):
            raise ValueError("Coordinates must be numbers")

        eff = data['effector']
        if eff < 0 or eff > 90:
            raise ValueError("Effector angle must be between 0 and 90")

        # Send to robot
        coords = [data['x'], data['y'], data['z'], data['effector']]
        response = harvestar.move_servos(coords)  # ✅ should accept 4 arguments now

        return jsonify(response)

    except Exception as e:
        print(f"[Flask ERROR]: {e}")
        return jsonify({
            'type': 'error',
            'message': str(e)
        }), 400
    

# === Global Replay State ===
replay_status = {
    "running": False,
    "messages": []
}


# === Endpoint: Start Replay ===
@app.route('/api/start-replay', methods=['POST'])
def start_replay():
    try:
        data = request.get_json(force=True)
        print("[DEBUG] Raw replay request payload:", data)

        index = data.get("index")
        print(f"[DEBUG] Received index: {index} ({type(index)})")

        try:
            index = int(index)
        except (TypeError, ValueError):
            raise ValueError("Replay index must be an integer.")

        run_replay(index)
        return jsonify({"success": True})

    except Exception as e:
        print("[ERROR] Replay start failed:", str(e))
        return jsonify({"success": False, "error": str(e)}), 400

# === Run Replay Logic ===
def run_replay(index):
    if index not in REPLAY_SEQUENCES:
        raise ValueError(f"Replay index {index} not defined")

    replay_status["running"] = True
    replay_status["messages"] = []

    print(f"[Replay] Running replay index: {index}")

    try:
        for coords, delay in REPLAY_SEQUENCES[index]:
            print(f"[Replay] Sending move: {coords}")
            response = harvestar.move_servos(coords)
            print("RESPONSE RECIVED, HOURAAY!")
            replay_status["messages"].append(response)
            time.sleep(delay)

        done_message = {
            "type": "done",
            "message": f"Replay {index} completed!"
        }
        replay_status["messages"].append(done_message)

    except Exception as e:
        print(f"[Replay ERROR] {e}")
        replay_status["messages"].append({"type": "error", "message": str(e)})

    replay_status["running"] = False

# === Endpoint: Poll Replay Updates ===
@app.route('/api/replay-status', methods=['GET'])
def replay_status_api():
    try:
        print("Status check!")
        messages = replay_status["messages"]
        replay_status["messages"] = []  # Clear buffer after sending
        return jsonify({
            "done": not replay_status["running"],
            "messages": messages
        })

    except Exception as e:
        return jsonify({"type": "error", "message": str(e)}), 500


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5050, debug=True, use_reloader=False, threaded=True)
