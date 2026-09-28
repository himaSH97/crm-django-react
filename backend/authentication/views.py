from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users.models import User
from .serializers import UserRegistrationSerializer


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    authentication_classes = []
    permission_classes = [AllowAny]


class PublicTokenObtainPairView(TokenObtainPairView):
    authentication_classes = []
    permission_classes = [AllowAny]


class PublicTokenRefreshView(TokenRefreshView):
    authentication_classes = []
    permission_classes = [AllowAny]