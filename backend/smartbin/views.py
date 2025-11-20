from django.shortcuts import render
from django.db.models import OuterRef, Subquery
from .models import SmartBin, WasteReading
from rest_framework import generics
from .serializers import SmartBinSerializer, WasteReadSerializer
from rest_framework.permissions import AllowAny 
# Create your views here.

class createSmartBinView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = SmartBin.objects.all()
    serializer_class = SmartBinSerializer
    
class createWasteReadingView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = WasteReading.objects.all()
    serializer_class = WasteReadSerializer


class LatestWasteReadingPerBinView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = WasteReadSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Subquery: get the latest reading ID per bin
        latest_readings_subquery = WasteReading.objects.filter(
            bin=OuterRef('bin')
        ).order_by('-timestamp').values('id')[:1]

        # Select only readings whose ID is in the latest readings subquery
        queryset = WasteReading.objects.filter(
            id__in=Subquery(latest_readings_subquery)
        ).order_by('-timestamp')

        return queryset
    
