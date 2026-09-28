from rest_framework import serializers

from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ActivityLog
        fields = ('id', 'user', 'action', 'model_name', 'object_id', 'timestamp')