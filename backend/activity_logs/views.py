from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from .models import ActivityLog
from .pagination import ActivityLogPagination
from .permissions import ActivityLogReadPermission
from .serializers import ActivityLogSerializer


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated, ActivityLogReadPermission]
    pagination_class = ActivityLogPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['model_name', 'user__username', 'object_id']
    ordering_fields = ['timestamp', 'action', 'model_name']
    ordering = ['-timestamp']

    def get_queryset(self):
        queryset = ActivityLog.objects.for_organization(
            self.request.user.organization,
        ).select_related('user')

        action = self.request.query_params.get('action')
        model_name = self.request.query_params.get('model_name')
        username = self.request.query_params.get('username')

        if action:
            queryset = queryset.filter(action=action)
        if model_name:
            queryset = queryset.filter(model_name__iexact=model_name)
        if username:
            queryset = queryset.filter(user__username__icontains=username)

        return queryset