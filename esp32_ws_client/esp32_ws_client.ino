#include "bt/hc.cpp"
#include "ws/ws.cpp"

void setup() {
  pinMode(BUZZER, OUTPUT);
  lcd.begin();
  lcd.backlight();

  bt_init();
  ws_init();
}

void loop() {
  // let the websockets client check for incoming messages
  if (client.available()) {
    client.poll();
  }
  client.pong();

  delay(500);
}
