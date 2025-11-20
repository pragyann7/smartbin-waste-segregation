from tensorflow.keras.models import load_model
import numpy as np
from tensorflow.keras.preprocessing import image
from PIL import Image
import time
import os

MODEL_PATH = "models/train_model.h5"
CLASS_NAMES = ['glass waste', 'metal waste', 'organic waste', 'plastic waste']

print("Loading Waste Classification Model...")
model = load_model(MODEL_PATH)
print("Model loaded successfully!")

def predict_image(img_file):    
    img = Image.open(img_file).resize((224, 224))
    img_array = np.expand_dims(np.array(img), axis=0) / 255.0
    start_time=time.time()
    predictions = model.predict(img_array)
    end_time = time.time()
    predicted_index = np.argmax(predictions, axis=1)[0]
    predicted_label = CLASS_NAMES[predicted_index]

    return start_time,end_time,predicted_label, predictions[0].tolist()
