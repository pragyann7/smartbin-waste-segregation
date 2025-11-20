#include <Servo.h>

Servo servo1;
Servo servo2;

String input = "";
bool commandComplete = false;

void setup() {
  Serial.begin(115200);

  servo1.attach(4);   // GPIO4 (D2)
  servo2.attach(5);   // GPIO5 (D1)

  servo1.write(90);
  servo2.write(90);

  Serial.println("ESP8266 Ready for SERIAL commands");
}

void loop() {
  // Read UART command from ESP32-CAM
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      commandComplete = true;
      break;
    }
    input += c;
  }

  if (commandComplete) {
    input.trim();

    // Expected format: S1:ANGLE or S2:ANGLE
    if (input.startsWith("S")) {
      int servoNum = input.substring(1, 2).toInt();
      int angle = input.substring(3).toInt();

      Serial.print("Received: ");
      Serial.println(input);

      if (servoNum == 1 && angle >= 0 && angle <= 180) {
        servo1.write(angle);
        delay(20);
        Serial.println("S1:DONE");
      }
      else if (servoNum == 2 && angle >= 0 && angle <= 180) {
        servo2.write(angle);
        delay(20);
        Serial.println("S2:DONE");
      }
    }

    input = "";
    commandComplete = false;
  }
}
