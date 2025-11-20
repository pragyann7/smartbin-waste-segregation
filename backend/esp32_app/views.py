from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from .ml_model import predict_image
from .models import WastePrediction
from django.core.files.base import ContentFile
from rest_framework.permissions import AllowAny
import os, time

class WastePredictView(APIView):
    permission_classes = [AllowAny] 
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('image')
        if not file_obj:
            print("No image received in request")
            return JsonResponse({"error": "No image received"}, status=400)

        start_time, end_time, label, scores = predict_image(file_obj)
        
        inference_time = end_time - start_time

        print("\n================= NEW PREDICTION =================")
        print(f"Image Name      : {file_obj.name}")
        print(f"Predicted Class : {label}")
        print(f"Confidence Scores: {scores}")
        print(f"Inference Time  : {inference_time:.4f} secs")

        try:
            prediction = WastePrediction.objects.create(
                image_name=file_obj.name,
                predicted_class=label,
                glass_confidence=scores[0],
                metal_confidence=scores[1],
                organic_confidence=scores[2],
                plastic_confidence=scores[3],
                inference_time=inference_time
            )
            
            # save the image file itself 
            timestamp = int(time.time())      
            ext = os.path.splitext(file_obj.name)[1]
            new_filename = f"{label}_{timestamp}{ext}"
            file_obj.seek(0)
            prediction.image.save(new_filename, ContentFile(file_obj.read()), save=True)

            
            print(f"Saved to DB     :  (ID: {prediction.id})")
            print("=================================================\n")
            
        except Exception as e:
            print(f"DB Save Error   :  ({str(e)})")
            print("=================================================\n")

        # Send JSON response to client p
        return JsonResponse({
            "predicted_class": label,
            "confidence_scores": scores,
        })