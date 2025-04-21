"""from .comms import SerialDevice
import json
import time

class ArmController:
    #Controls movement of the Robot Arm via the Robot Arm Pico.
    
    def __init__(self, port):
        #
        #Initializes the Arm Controller.
        #
        #Args:
        #    port: The serial connection to the Robot Arm Pico.
        
        self.serial_device = SerialDevice(port)
        if self.serial_device.serial:
            self.serial_device.wait_for_ready()  # Should print "Device is ready!"
        self.coods = [10.5, 0, 15, 45]  # Initial angles for base, shoulder, elbow


    def move_servos(self, coords):
        command = json.dumps({"type": "move", "data": coords})  # ← append newline
        print(f"[DEBUG] About to send over serial: {command}")
        self.serial_device.send(command.encode())
        print("GIGA GOON!")
        return self.listen()
        
    def send_message(self, index):
        # print(f"[HarveStar] Sending: {message}")
        # json_msg = json.dumps(message).encode()
        # json_msg = json.dumps({"type": "replay", "index": 0}).encode()
        # self.serial_device.send(json_msg)
        
        message = {"type": "replay", "index": index}
        json_str = json.dumps(message)  # ✅ ensures valid JSON with double quotes
        print(f"[HarveStar] Sending JSON: {json_str}")  # Log the actual string
        self.serial_device.send((json_str + "\n").encode())  # ✅ send properly encoded

    
    def wait_until_ready(self, timeout=30):
        
        # Blocks until it receives a 'ready' message from the robot arm, or until timeout (in seconds).
        
        print("[ArmController] Waiting for 'ready' signal from robot...")

        start = time.time()
        while time.time() - start < timeout:
            response = self.serial_device.receive(wait=True)
            if response:
                try:
                    data = json.loads(response)
                    if data.get("type") == "ready":
                        print("[ArmController] Received 'ready' from robot.")
                        return True
                except json.JSONDecodeError:
                    continue
            time.sleep(0.05)

        print("[ArmController] Timeout waiting for 'ready'")
        return False



    def listen(self):
        # Wait for acknowledgment and extract full response
        while True:
            response = self.serial_device.receive(wait=True)
            if response:
                try:
                    response_data = json.loads(response)  # Parse JSON
                    print(f"[ArmController] Got response: {response_data}")
                    return response_data  # ✅ Just return the full object now
                except json.JSONDecodeError:
                    print("[ArmController] Invalid JSON received.")
                    pass  # Ignore and keep waiting
            time.sleep(0.01)"""



# arm_controller.py

import json
import time
from .serial_worker import SerialWorker  # <-- new module with safe thread
from .comms import SerialDevice  # ← no longer needed directly

class ArmController:
    """Controls movement of the Robot Arm via the SerialWorker thread."""

    def __init__(self, port):
        """
        Initializes the Arm Controller.

        Args:
            port: The serial connection to the Robot Arm Pico.
        """
        self.serial_worker = SerialWorker(port)
        self.serial_device = SerialDevice(port)
        self.coords = [10.5, 0, 15, 45]  # Initial angles for base, shoulder, elbow

        print("[ArmController] Waiting for robot to be ready...")
        if not self.wait_until_ready():
            print("[ArmController] Robot not ready – check connection.")

    def move_servos(self, coords):
        command = {"type": "move", "data": coords}
        print(f"[DEBUG] About to send to SerialWorker: {command}")
        response = self.serial_worker.send_command(command)
        print(f"[ArmController] Got response: {response}")
        return response

    def send_message(self, index):
        message = {"type": "replay", "index": index}
        print(f"[ArmController] Sending replay message: {message}")
        self.serial_worker.send_command(message)

    def wait_until_ready(self, timeout=30):
        # Waits for a message from the robot indicating it's ready.
        start_time = time.time()
        while time.time() - start_time < timeout:
            response = self.serial_worker.send_command({"type": "pinged"})
            if response and response.get("type") == "ready":
                print("[ArmController] Robot is ready!")
                return True
            time.sleep(2)
        return False
    
    def listen(self):
        while True:
            response = self.serial_worker.get_command()
            if response:
                try:
                    response_data = json.loads(response)
                    print(f"[ArmController] Got response: {response_data}")
                    return response_data
                except json.JSONDecodeError:
                    print("[ArmController] Invalid JSON received.")
                    pass
            time.sleep(0.01)
    
    
    """def wait_until_ready(self, timeout=30):
        
        # Blocks until it receives a 'ready' message from the robot arm, or until timeout (in seconds).
        
        print("[ArmController] Waiting for 'ready' signal from robot...")

        start = time.time()
        while time.time() - start < timeout:
            response = self.serial_device.receive(wait=True)
            if response:
                try:
                    data = json.loads(response)
                    if data.get("type") == "pined":
                        print("[ArmController] Received 'ready' from robot.")
                        return True
                except json.JSONDecodeError:
                    continue
            time.sleep(0.05)

        print("[ArmController] Timeout waiting for 'ready'")
        return False"""

    def shutdown(self):
        """Stops the SerialWorker thread gracefully."""
        self.serial_worker.stop()
