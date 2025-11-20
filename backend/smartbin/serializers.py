from .models import SmartBin, WasteReading
from rest_framework import serializers

class SmartBinSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmartBin
        fields = "__all__"

class WasteReadSerializer(serializers.ModelSerializer):
    fill_status = serializers.SerializerMethodField()
    full_address = serializers.ReadOnlyField

    class Meta:
        model = WasteReading
        fields = ['id', 'bin', 'metal', 'plastic', 'bio', 'glass', 'fill_level',
                  'fill_status','full_address', 'battery_level', 'timestamp']
        
    def get_fill_status(self, obj):
        return obj.fill_status