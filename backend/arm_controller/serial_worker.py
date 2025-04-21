# serial_worker.py

import threading
import queue
import json
import time
from .comms import SerialDevice  # ← your existing class

class SerialWorker:
    def __init__(self, port, baudrate=115200):
        self.device = SerialDevice(port, baudrate)
        self.command_queue = queue.Queue()
        self.response_queue = queue.Queue()
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.shutdown_flag = threading.Event()
        self.thread.start()

    def _run(self):
        print("[SerialWorker] Thread started.")
        while not self.shutdown_flag.is_set():
            try:
                command = self.command_queue.get(timeout=0.1)  # Wait for a command
                if command is None:
                    continue

                # Send command over serial
                print(f"[SerialWorker] Got command: {command}")
                self.device.send(json.dumps(command).encode())

                # Wait for valid JSON response
                while True:
                    line = self.device.receive(wait=True)
                    if not line:
                        continue

                    try:
                        parsed = json.loads(line)
                        print(f"[SerialWorker] Parsed valid response: {parsed}")
                        self.response_queue.put(parsed)
                        break
                    except json.JSONDecodeError:
                        print(f"[SerialWorker] Ignored non-JSON message: {line}")
                        continue

            except queue.Empty:
                continue
            except Exception as e:
                print(f"[SerialWorker] Error in thread loop: {e}")

    def send_command(self, command, timeout=10):
        """
        Sends a command to the serial worker and waits for the response.
        Returns the parsed JSON response or None on timeout.
        """
        self.command_queue.put(command)
        try:
            response = self.response_queue.get(timeout=timeout)
            return response
        except queue.Empty:
            print("[SerialWorker] Timeout waiting for response.")
            return None
        
    def get_command(self):
        try:
            return self.command_queue.get()
        except queue.Empty:
            print("[SerialWorker] No command in queue.")
            return None

    def stop(self):
        self.shutdown_flag.set()
        self.thread.join()
