#include <ArduinoWebsockets.h>


WebSocketClient client;

void setup() {
  Serial.begin(115200);


  // Set the WebSocket server URL and port number
  client.begin("192.168.2.50", 5000);

  // Wait for the WebSocket connection to be established
  while (!client.available()) {
    delay(50);
  }

  // Send a message to the server
  client.sendTXT("Hello from ESP32!");
}

void loop() {
  // Check for incoming messages from the server
  client.loop();

  /*
  // Handle incoming messages
  while (client.available()) {
    String message = client.readString();
    Serial.println("Received message from server: " + message);
  }
  */
}