#include "defines_bt.h"
#include "../ws/defines_ws.h"

SoftwareSerial hc06(HC_TX, HC_RX);

void parse_bt_resp(String response) {
    String cmd[2];
    int str_cnt = 0;

    while (response.length() > 0 && str_cnt < 2) {
        int index = response.indexOf(' ');
        if (index == -1) { // no space found
            cmd[str_cnt++] = response;
            break;

        } else {
            cmd[str_cnt++] = response.substring(0, index);
            response = response.substring(index+1);
        }
    }
	cmd[1].remove(cmd[1].length() - 1, 1);

	if (cmd[0] == "ssid") {
		Serial.print("The ssid is now: ");
		Serial.println(cmd[1]);
		ssid = String(cmd[1]);

	} else if (cmd[0] == "pass") {
		Serial.print("The wifi password is now: ");
		Serial.println(cmd[1]);
		password = String(cmd[1]);

	} else if (cmd[0] == "user") {
		Serial.print("The username is now: ");
		Serial.println(cmd[1]);
		username = String(cmd[1]);

	} else {
		Serial.println("Error: unknown command.");
	}
}

void bt_init() {
    Serial.begin(115200);
	hc06.begin(9600);

	// awaits at max 5 seconds for the Serial to begin
    while (!Serial && millis() < 5000);

	while(ssid == "" || password == "" || username == "") {
		if (hc06.available()) {
			parse_bt_resp(hc06.readString());
		}
		delay(500);
	}
}
