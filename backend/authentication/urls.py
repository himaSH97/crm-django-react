from django.urls import path

from .views import (
    PublicTokenObtainPairView,
    PublicTokenRefreshView,
    UserPermissionsView,
    UserRegistrationView,
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('token/', PublicTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', PublicTokenRefreshView.as_view(), name='token_refresh'),
    path('permissions/', UserPermissionsView.as_view(), name='user-permissions'),
]