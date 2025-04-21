from .comms import SerialDevice
import json
import time
from typing import List, Dict, Any, Optional

class ArmController:
    """Controls movement of the Robot Arm via the SerialDevice."""
    
    def __init__(self, port: str):
        """
        Initialize the Arm Controller.

        Args:
            port: The serial connection to the Robot Arm Pico.
        """
        self.serial_device = SerialDevice(port)
        self.coords: List[float] = [10.5, 0, 15, 45]  # Initial angles for base, shoulder, elbow

        print("[ARM] Waiting for robot to be ready...")
        if not self.wait_until_ready():
            print("[ARM ERROR] Robot not ready – check connection.")

    def move_servos(self, coords: List[float]) -> Dict[str, Any]:
        """
        Send movement command to the arm and wait for response.
        
        Args:
            coords: List of [x, y, z, effector] coordinates
            
        Returns:
            Dict containing the response from the arm
        """
        command = {
            "type": "move",
            "data": coords,
            # "request_id": f"move_{int(time.time() * 1000)}"
        }
        print(f"[ARM] Sending move command: {command}")
        
        # Send command and wait for response
        self.serial_device.send(command)
        response = self.serial_device.receive(wait=True, timeout=5.0)
        
        if response:
            print(f"[ARM] Move response: {response}")
            return response
        else:
            print("[ARM ERROR] No response received from move command")
            return {"type": "error", "message": "No response received"}

    def send_message(self, index: int) -> Optional[Dict[str, Any]]:
        """
        Send a replay sequence command.
        
        Args:
            index: The index of the replay sequence to execute
            
        Returns:
            Dict containing the response from the arm, or None if no response
        """
        message = {
            "type": "replay",
            "index": index,
            # "request_id": f"replay_{int(time.time() * 1000)}"
        }
        print(f"[ARM] Sending replay message: {message}")
        self.serial_device.send(message)
        return self.serial_device.receive(wait=True, timeout=5.0)

    def wait_until_ready(self, timeout: float = 30.0) -> bool:
        """
        Wait for the robot to be ready.
        
        Args:
            timeout: Maximum time to wait for ready signal in seconds
            
        Returns:
            bool indicating if the robot is ready
        """
        start_time = time.time()
        while time.time() - start_time < timeout:
            command = {
                "type": "ping",
                # "request_id": f"ping_{int(time.time() * 1000)}"
            }
            self.serial_device.send(command)
            response = self.serial_device.receive(wait=True, timeout=2.0)
            
            if response and response.get("type") == "ready":
                print("[ARM] Robot is ready!")
                return True
                
            time.sleep(1)
            
        print("[ARM ERROR] Timeout waiting for robot ready")
        return False

    def shutdown(self) -> None:
        """Clean up resources."""
        if hasattr(self, 'serial_device'):
            self.serial_device.close()

    def listen(self) -> Optional[Dict[str, Any]]:
        """
        Listen for a single message from the arm, waiting indefinitely until a message is received.
        
        Returns:
            Dict containing the received message, or None if no message received
        """
        return self.serial_device.receive(wait=True)
