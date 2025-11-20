from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from . serializers import LoginSerializer
class LoginView(APIView):
    permission_classes = []  

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)  # <-- Django session
                return Response({"message": "Login successful", "username": username})
            return Response({"error": "Invalid username or password"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = []

    def post(self, request):
        logout(request)
        return Response({"message": "Logged out successfully"})
