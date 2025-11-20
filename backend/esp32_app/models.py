from django.db import models
from django.utils import timezone

class WastePrediction(models.Model):
    image_name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='waste_images/', null=True, blank=True)
    
    predicted_class = models.CharField(max_length=50, choices=[
        ('glass waste', 'Glass Waste'),
        ('metal waste', 'Metal Waste'),
        ('organic waste', 'Organic Waste'),
        ('plastic waste', 'Plastic Waste'),
    ])
    
    glass_confidence = models.FloatField()
    metal_confidence = models.FloatField()
    organic_confidence = models.FloatField()
    plastic_confidence = models.FloatField()
    
    inference_time = models.FloatField(help_text="Time taken for prediction in seconds")
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Waste Prediction'
        verbose_name_plural = 'Waste Predictions'
    
    def __str__(self):
        return f"{self.predicted_class} - {self.image_name} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
    
    @property
    def max_confidence(self):
        """Returns the highest confidence score"""
        return max(self.glass_confidence, self.metal_confidence, 
                   self.organic_confidence, self.plastic_confidence)