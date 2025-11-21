# SmartBin – AI Powered Waste Segregation System

SmartBin is an **open-source IoT + AI waste-segregation system** that detects waste type using an ESP32-CAM and a machine-learning model, then rotates and tilts servo motors via an ESP8266 to drop the waste into the correct bin (metal, plastic, organic, glass).

This project combines **embedded systems, machine learning, computer vision, and IoT engineering** into a complete working product.

---

## 🚀 Features

* 📷 **ESP32-CAM** captures real-time waste images
* 🤖 **ML model (MobileNetV2)** classifies waste into 4 categories
* 🔗 **REST API (Django backend)** processes images and returns prediction
* ⚙️ **ESP8266** rotates servo motors instantly (no smoothing) for segregation
* 📡 Wi-Fi enabled communication between modules
* 🔌 Fully open-source hardware + software
* 🛠 Easy to build, modify, expand, or integrate into smart city solutions

---

## 📂 Project Structure

```
smartbin-waste-segregation/
│
├── firmware/
│   ├── esp32_camera/          # ESP32-CAM image capture & send
│   ├── esp8266_servo/         # ESP8266 quick rotation + tilt code
│   └── tests/                 # Calibration / serial testing scripts
│
├── backend/
│   ├── django_api/            # Predict endpoint (REST)
│   └── model_server/          # ML model load & inference
│
├── model/
│   ├── mobilenet_v2_model.h5
│   ├── training_notebooks/
│   └── labels.txt
│
├── hardware/
│   ├── circuit_diagrams/
│   ├── wiring/
│   └── bill_of_materials.md
│
├── design/
│   ├── 3d_models/
│   └── bin_photos/
│
├── docs/
│   ├── installation.md
│   ├── api_endpoints.md
│   ├── architecture.md
│   └── troubleshooting.md
│
├── LICENSE
└── README.md
```

---

## 🧠 System Architecture

1. **Waste detected → ESP32-CAM captures image**
2. ESP32 sends the image (JPEG) via HTTP POST to Django API
3. Backend loads ML model and predicts class
4. Prediction is sent to ESP8266
5. ESP8266 rotates the servo instantly to the correct angle
6. Tilts the flap so waste drops into bin
7. Returns to default position

---

## 🛠 Hardware Requirements

* ESP32-CAM
* ESP8266 (NodeMCU or Wemos)
* SG90 / MG996R servo motors
* Buck converter (recommended for servo power)
* 5V–6V power supply
* Jumper wires
* Waste bin mechanical setup
* Optional: 3D printed case, PCB, or wooden body

---

## 🤖 Software Requirements

* Arduino IDE or PlatformIO
* Python 3.8+
* Django + REST Framework
* TensorFlow / Keras
* OpenCV (optional for debug)

Install backend dependencies:

```
pip install -r requirements.txt
```

Run backend server:

```
python manage.py runserver 0.0.0.0:8000
```

---

## 🧪 API Endpoint

**POST /predict/**

Send image:

```
curl -X POST -F "file=@test.jpg" http://<your-ip>:8000/predict/
```

Response:

```
{
  "class": "plastic_waste",
  "confidence": 0.94
}
```

---

## 🧩 Firmware Overview

### ESP32-CAM

* Captures image when motion detected / loop
* Compresses JPEG
* Sends to Django server
* Receives classification text

### ESP8266 Servo Module

* Receives string like `"plastic_waste"`
* Instantly rotates servo (45°, 90°, 135°, etc.)
* Tilts flap for short duration
* Resets to idle position

---

## 🧰 Servo Angles (Example)

| Waste Type    | Rotation Angle | Tilt |
| ------------- | -------------- | ---- |
| glass_waste   | 135°           | Yes  |
| metal_waste   | 45°            | Yes  |
| organic_waste | 135°           | Yes  |
| plastic_waste | 45°            | Yes  |

---

## 🖼 Images / Demo

(Add your images here once you upload them)

```
smartbin-waste-segregation/designs&img/img/smartbin.jpg
```

---

## 📜 License

This project is released under the **MIT License**.
This means you can use it freely for personal, academic, commercial, or startup purposes — just credit the author.

---

## 🤝 Contributing

Pull requests are welcome!

You can contribute by:

* improving the ML model
* adding better hardware design
* optimizing servo control
* adding LoRaWAN / MQTT features
* writing documentation

---

## ⭐ Acknowledgements

* TensorFlow MobileNetV2
* ESP32-CAM community
* Django REST Framework
* Open-source IoT community

---

## 📬 Contact

If you build or improve this SmartBin, feel free to share your version!

---

** — Open Source for Everyone**
