#include "defines_ws.h"
#include "defines_sig.h"

#define OFFSET(str) ((17 - str.length())/2)
#define TERMINATE Serial.println("Program terminated!"); while(1); 

using namespace websockets2_generic;
WebsocketsClient client;

void onEventsCallback(WebsocketsEvent event, String data) {
    if (event == WebsocketsEvent::ConnectionOpened) {
        Serial.println("Connnection Opened");

    } else if (event == WebsocketsEvent::ConnectionClosed) {
        Serial.println("Connnection Closed");

    } 
}

void parse_ws_resp(String response) {
    String cmd[4];
    int str_cnt = 0;

    while (response.length() > 0 && str_cnt < 4) {
        int index = response.indexOf(' ');
        if (index == -1) { // no space found
            cmd[str_cnt++] = response;
            break;

        } else {
            cmd[str_cnt++] = response.substring(0, index);
            response = response.substring(index+1);
        }
    }

    if (cmd[0] == "sA") { // startAlarm
        for (int i = 0; i < 15; i++) { // 9 seconds total buzzing
            digitalWrite(BUZZER, HIGH);
            delay(300);
            digitalWrite(BUZZER, LOW);
            delay(300);
        }

    } else if (cmd[0] == "cN") { // changeNotification
        lcd.clear();
        lcd.setCursor(OFFSET(cmd[1]), 0);
        lcd.print(cmd[1]);
        lcd.setCursor(OFFSET(cmd[2]), 1);
        lcd.print(cmd[2]);
    }
}

void ws_init() {
    // connects to wifi
	char ssid_tmp[32];
	char password_tmp[32];
	ssid.toCharArray(ssid_tmp, ssid.length());
	password.toCharArray(password_tmp, password.length());

	Serial.println(ssid_tmp);
	Serial.println(password_tmp);

    WiFi.begin(ssid_tmp, password_tmp);
    Serial.print("Connecting to WiFi: ");
    for (int i = 0; i < 10 && WiFi.status() != WL_CONNECTED; i++) {
        Serial.print(".");
        delay(2500);
    }

	// if we can not connect to wifi
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("No Wifi!");
		TERMINATE
    }

    Serial.print("Connected to Wifi, Connecting to WebSockets Server @");
    Serial.println(websockets_server_host);

    // parses the given message
    client.onMessage([&](WebsocketsMessage message) {
				Serial.print("Got Message: ");
				Serial.println(message.data());
				parse_ws_resp(message.data());
            });

    // useful for debugging
    client.onEvent(onEventsCallback);

    // connecting to ws server
    bool connected = client.connect(websockets_server_host, websockets_server_port, "/");
    if (connected) {
        Serial.println("Connected to WebSocket Server.");
		client.send(username);

    } else {
        Serial.println("Could Not Connect to WebSocket Server.");
		TERMINATE
    }
}

