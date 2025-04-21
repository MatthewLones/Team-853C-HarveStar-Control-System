import serial
import time
import json
from typing import Optional, Dict, Any

class SerialDevice:
    """Handles serial communication with a MicroPython/CircuitPython device."""
    
    def __init__(self, port: str, baudrate: int = 115200, timeout: float = 2.0):
        """Initialize the serial device with connection parameters."""
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self.serial: Optional[serial.Serial] = None
        self.last_request_time: float = 0
        self.min_request_interval: float = 0.1  # Minimum time between requests in seconds
        
        self._connect()

    def _connect(self) -> None:
        """Establish serial connection."""
        try:
            self.serial = serial.Serial(self.port, self.baudrate, timeout=self.timeout)
            print(f"[SERIAL] Connected to {self.port} at {self.baudrate} baud")
        except serial.SerialException as e:
            print(f"[SERIAL ERROR] Could not open serial port {self.port}: {e}")
            self.serial = None

    def _can_send_request(self) -> bool:
        """Check if enough time has passed since the last request."""
        return time.time() - self.last_request_time >= self.min_request_interval

    def _wait_for_request_interval(self) -> None:
        """Wait until enough time has passed since the last request."""
        while not self._can_send_request():
            time.sleep(0.01)

    def send(self, message: Dict[str, Any]) -> None:
        """Send a message to the device."""
        if not self.serial:
            return

        # Wait for minimum interval between requests
        self._wait_for_request_interval()

        try:
            # Convert to JSON and send
            json_message = json.dumps(message) + '\n'
            self.serial.write(json_message.encode('utf-8'))
            self.serial.flush()
            self.last_request_time = time.time()
            
            print(f"[SERIAL] {time.time():.3f} Sending: {json_message}")
        except Exception as e:
            print(f"[SERIAL ERROR] Failed to send: {e}")

    def receive(self, wait: bool = True, timeout: float = 2.0) -> Optional[Dict[str, Any]]:
        """Receive and parse response from the device."""
        if not self.serial or not self.serial.is_open:
            return None

        start_time = time.time()
        while wait and time.time() - start_time < timeout:
            if self.serial.in_waiting:
                try:
                    raw = self.serial.readline()
                    response = raw.decode('utf-8', errors='ignore').strip()
                    if response:
                        # Print all incoming messages for debugging
                        print(f"[SERIAL] {time.time():.3f} Raw message: {repr(response)}")
                        try:
                            parsed = json.loads(response)
                            print(f"[SERIAL] {time.time():.3f} Parsed JSON: {parsed}")
                            return parsed
                        except json.JSONDecodeError:
                            print(f"[SERIAL] {time.time():.3f} Non-JSON message received (debug print)")
                except Exception as e:
                    print(f"[SERIAL ERROR] Failed to receive: {e}")
            time.sleep(0.01)
        
        return None

    def wait_for_ready(self, max_attempts: int = 10, response_timeout: float = 2.0) -> bool:
        """Wait for device to initialize."""
        print("[SERIAL] Waiting for device to initialize...")

        for attempt in range(max_attempts):
            self.send({"type": "ping"})
            response = self.receive(wait=True, timeout=response_timeout)
            
            if response and response.get("type") == "ready":
                print("[SERIAL] Device is ready!")
                return True

            print(f"[SERIAL] Attempt {attempt + 1} failed. Retrying...")

        print("[SERIAL ERROR] Device did not respond. Check connection.")
        return False

    def close(self) -> None:
        """Close the serial connection."""
        if not self.serial:
            print("[SERIAL] Warning: Serial port was not open.")
            return
        try:
            self.serial.close()
            print("[SERIAL] Connection closed.")
        except serial.SerialException as e:
            print(f"[SERIAL ERROR] Failed to close serial connection: {e}")
