from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users.permissions import ROLE_PERMISSIONS


class PublicTokenObtainPairView(TokenObtainPairView):
    authentication_classes = []
    permission_classes = [AllowAny]


class PublicTokenRefreshView(TokenRefreshView):
    authentication_classes = []
    permission_classes = [AllowAny]


class UserPermissionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'username': request.user.username,
            'role': request.user.role,
            'permissions': sorted(ROLE_PERMISSIONS.get(request.user.role, set())),
        })