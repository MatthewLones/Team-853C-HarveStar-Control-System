import serial
import time
import json

class SerialDevice:
    """Handles serial communication with a MicroPython/CircuitPython device."""
    
    def __init__(self, port, baudrate=115200, timeout=2):
        try:
            self.serial = serial.Serial(port, baudrate, timeout=timeout)
            print(f"Connected to {port} at {baudrate} baud.")
        except serial.SerialException as e:
            print(f"Error: Could not open serial port {port}. {e}")
            self.serial = None

    def send(self, message):
        if self.serial:
            try:
                if isinstance(message, str):
                    message = (message + "\n").encode()
                elif isinstance(message, bytes):
                    message += b"\n"
                else:
                    raise TypeError("Message must be a string or bytes.")
                self.serial.write(message)
                self.serial.flush()
                print(f"[SERIAL] {time.time()} Sending: {message}")
            except Exception as e:
                print(f"[SERIAL ERROR] Failed to send: {e}")

    def receive(self, wait=True):
        if self.serial and self.serial.is_open:
            try:
                while wait and not self.serial.in_waiting:
                    time.sleep(0.01)
                if self.serial.in_waiting:
                    raw = self.serial.readline()
                    response = raw.decode('utf-8', errors='ignore').strip()
                    if response:
                        print(f"[SERIAL] {time.time()} Received: {repr(response)}")
                    return response
            except Exception as e:
                print(f"[SERIAL ERROR] Failed to receive: {e}")
        return None


    def wait_for_ready(self, max_attempts=10, response_timeout=2.0):
        print("Waiting for device to initialize...")

        for attempt in range(max_attempts):
            self.send("ping")

            start_time = time.time()
            while time.time() - start_time < response_timeout:
                response = self.receive(wait=False)
                if response == "READY":
                    print("Device is ready!")
                    return True
                time.sleep(0.1)

            print(f"Attempt {attempt + 1} failed. Retrying...")

        print("Error: Device did not respond. Check connection.")
        return False

    def close(self):
        if not self.serial:
            print("Warning: Serial port was not open.")
            return
        try:
            self.serial.close()
            print("Serial connection closed.")
        except serial.SerialException as e:
            print(f"Error: Failed to close serial connection. {e}")
