#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>

const char *ssid = "wifi_name";
const char *password = "wifi_password";
const char *serverUrl = "http://192.168.1.10:8000/predict/";

#define PWDN_GPIO_NUM 32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM 0
#define SIOD_GPIO_NUM 26
#define SIOC_GPIO_NUM 27
#define Y9_GPIO_NUM 35
#define Y8_GPIO_NUM 34
#define Y7_GPIO_NUM 39
#define Y6_GPIO_NUM 36
#define Y5_GPIO_NUM 21
#define Y4_GPIO_NUM 19
#define Y3_GPIO_NUM 18
#define Y2_GPIO_NUM 5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM 23
#define PCLK_GPIO_NUM 22
#define FLASH_LED_PIN 4
#define PIR_PIN 13

volatile bool motion = false;
bool processing = false;

unsigned long lastMotionTime = 0;
const unsigned long pirCooldown = 3000;

int servo1Pos = 90;
int servo2Pos = 90;

void IRAM_ATTR handleMotion()
{
    if (!processing && (millis() - lastMotionTime > pirCooldown))
    {
        motion = true;
        lastMotionTime = millis();
    }
}

bool waitAck(const String &expectedAck, unsigned long timeout = 2000)
{
    unsigned long start = millis();

    while (millis() - start < timeout)
    {
        if (Serial.available())
        {
            String line = Serial.readStringUntil('\n');
            line.trim();
            if (line == expectedAck)
            {
                return true;
            }
        }
        delay(5);
    }
    return false;
}

bool sendServoCommand(int servo, int angle)
{
    String cmd = "S" + String(servo) + ":" + String(angle);
    String ack = "S" + String(servo) + ":DONE";

    Serial.println(cmd); // Send via USB Serial to ESP8266
    return waitAck(ack, 2000);
}

void resetServos()
{
    if (servo2Pos != 90)
    {
        if (sendServoCommand(2, 90))
        {
            servo2Pos = 90;
            delay(600);
        }
    }
    if (servo1Pos != 90)
    {
        if (sendServoCommand(1, 90))
        {
            servo1Pos = 90;
            delay(600);
        }
    }
}

int getRotate(String cls)
{
    if (cls == "glass_waste")
        return 135;
    if (cls == "metal_waste")
        return 45;
    if (cls == "organic_waste")
        return 135;
    if (cls == "plastic_waste")
        return 45;
    return 90;
}

int getTilt(String cls)
{
    if (cls == "glass_waste")
        return 10;
    if (cls == "metal_waste")
        return 10;
    if (cls == "organic_waste")
        return 170;
    if (cls == "plastic_waste")
        return 170;
    return 90;
}

void setup()
{
    Serial.begin(115200);

    pinMode(FLASH_LED_PIN, OUTPUT);
    digitalWrite(FLASH_LED_PIN, LOW);
    pinMode(PIR_PIN, INPUT);

    // Connect WiFi
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    int wifiAttempts = 0;
    while (WiFi.status() != WL_CONNECTED && wifiAttempts++ < 30)
    {
        delay(300);
    }

    // Camera config
    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;
    config.pin_d0 = Y2_GPIO_NUM;
    config.pin_d1 = Y3_GPIO_NUM;
    config.pin_d2 = Y4_GPIO_NUM;
    config.pin_d3 = Y5_GPIO_NUM;
    config.pin_d4 = Y6_GPIO_NUM;
    config.pin_d5 = Y7_GPIO_NUM;
    config.pin_d6 = Y8_GPIO_NUM;
    config.pin_d7 = Y9_GPIO_NUM;
    config.pin_xclk = XCLK_GPIO_NUM;
    config.pin_pclk = PCLK_GPIO_NUM;
    config.pin_vsync = VSYNC_GPIO_NUM;
    config.pin_href = HREF_GPIO_NUM;
    config.pin_sscb_sda = SIOD_GPIO_NUM;
    config.pin_sscb_scl = SIOC_GPIO_NUM;
    config.pin_pwdn = PWDN_GPIO_NUM;
    config.pin_reset = RESET_GPIO_NUM;
    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_JPEG;
    config.frame_size = FRAMESIZE_QVGA;
    config.jpeg_quality = 20;
    config.fb_count = 1;
    config.grab_mode = CAMERA_GRAB_LATEST;

    esp_camera_init(&config);

    // Initialize servos
    delay(2000);
    sendServoCommand(1, 90);
    delay(500);
    sendServoCommand(2, 90);

    // Ready indication
    for (int i = 0; i < 3; i++)
    {
        digitalWrite(FLASH_LED_PIN, HIGH);
        delay(100);
        digitalWrite(FLASH_LED_PIN, LOW);
        delay(100);
    }

    attachInterrupt(digitalPinToInterrupt(PIR_PIN), handleMotion, RISING);
}

void loop()
{
    if (motion && !processing)
    {
        motion = false;
        processing = true;

        // Capture
        camera_fb_t *fb = esp_camera_fb_get();
        if (!fb)
        {
            processing = false;
            return;
        }

        digitalWrite(FLASH_LED_PIN, HIGH);
        delay(30);
        digitalWrite(FLASH_LED_PIN, LOW);

        // Check WiFi
        if (WiFi.status() != WL_CONNECTED)
        {
            WiFi.reconnect();
            delay(2000);
            if (WiFi.status() != WL_CONNECTED)
            {
                esp_camera_fb_return(fb);
                processing = false;
                return;
            }
        }

        // Send to API
        HTTPClient http;
        http.begin(serverUrl);
        http.setTimeout(10000);
        http.setConnectTimeout(3000);

        String boundary = "----ESP32";
        http.addHeader("Content-Type", "multipart/form-data; boundary=" + boundary);

        String head = "--" + boundary + "\r\n"
                                        "Content-Disposition: form-data; name=\"image\"; filename=\"img.jpg\"\r\n"
                                        "Content-Type: image/jpeg\r\n\r\n";
        String tail = "\r\n--" + boundary + "--\r\n";

        uint32_t totalLen = head.length() + fb->len + tail.length();
        uint8_t *buf = (uint8_t *)malloc(totalLen);

        int httpCode = -1;
        String response = "";

        if (buf)
        {
            memcpy(buf, head.c_str(), head.length());
            memcpy(buf + head.length(), fb->buf, fb->len);
            memcpy(buf + head.length() + fb->len, tail.c_str(), tail.length());

            httpCode = http.POST(buf, totalLen);
            free(buf);

            if (httpCode == 200)
            {
                response = http.getString();
            }
        }

        http.end();
        esp_camera_fb_return(fb);

        // Process response
        if (httpCode == 200 && response.length() > 0)
        {
            int key = response.indexOf("\"predicted_class\"");
            if (key > 0)
            {
                int q1 = response.indexOf("\"", response.indexOf(":", key));
                int q2 = response.indexOf("\"", q1 + 1);
                String cls = response.substring(q1 + 1, q2);

                if (cls == "glass_waste" || cls == "metal_waste" ||
                    cls == "organic_waste" || cls == "plastic_waste")
                {

                    int rot = getRotate(cls);
                    int tilt = getTilt(cls);

                    if (sendServoCommand(1, rot))
                    {
                        servo1Pos = rot;
                        delay(1200);
                        if (sendServoCommand(2, tilt))
                        {
                            servo2Pos = tilt;
                            delay(1500);
                            resetServos();
                        }
                    }
                }
            }
        }

        processing = false;
    }

    delay(50);
}