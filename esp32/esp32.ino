#include <WiFi.h>

#include <WebSocketClient.h>

const char* ssid     = "Redmi 9T";
const char* password = "asdfghjkl";

char path[] = "/esp";
char host[] = "192.168.207.12";
int port = 80;
  
WebSocketClient webSocketClient;
WiFiClient client;

#include <LiquidCrystal_I2C.h>
#define i2c_lcd_addr 0x27

LiquidCrystal_I2C lcd(i2c_lcd_addr, 16, 2);

#define BUZZER 19

void setup() {
  Serial.begin(115200);
  delay(10);

  pinMode(BUZZER, OUTPUT);
  lcd.begin();
  lcd.backlight();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");  
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  delay(5000);

  // Connect to the websocket server
  if (client.connect(host, port)) {
    Serial.println("Connected");
  } else {
    Serial.println("Connection failed.");
    return;
  }

  // Handshake with the server
  webSocketClient.path = path;
  webSocketClient.host = host;
  if (webSocketClient.handshake(client)) {
    Serial.println("Handshake successful");
  } else {
    Serial.println("Handshake failed.");
    return;
  }
}

void parse_response(String response) {
  String cmd = "";
  int i = 0;
  for (i = 0; i < response.length(); i++) {
    if (response[i] != ' ') cmd += response[i];
    else break;
  }
  String arg = "";
  for (; i < response.length(); i++) {
    arg += response[i];
  }
  Serial.println("cmd: " + cmd);
  Serial.println("arg: " + arg);

  if (cmd == "startAlarm") {
    for (int i = 0; i < 20; i++) {
      digitalWrite(BUZZER, HIGH);
      delay(300);
      digitalWrite(BUZZER, LOW);
      delay(300);
    }
  
  } else if (cmd == "changeNotification") {
    String top_row = arg.substring(0, 16);
    String bottom_row = arg.substring(16, arg.length());
    Serial.println("top_row: " + top_row);
    Serial.println("bottom_row: " + bottom_row);

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(top_row);
    lcd.setCursor(0, 1);
    lcd.print(bottom_row);
  }
}

void loop() {
  String data = "getNotification";

  if (client.connected()) {
    webSocketClient.sendData(data);

    webSocketClient.getData(data);
    if (data.length() > 0) {
      parse_response(data);
      Serial.print("Received data: ");
      Serial.println(data);
    }
    data = "";
    
  } else {
    Serial.println("Client disconnected.");
    client.connect(host, port);
    webSocketClient.handshake(client);
  }

  delay(1000); 
}

