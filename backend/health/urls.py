from django.urls import path

from .views import database_health, health

urlpatterns = [
    path('health/', health, name='health'),
    path('health/database/', database_health, name='database-health'),
]