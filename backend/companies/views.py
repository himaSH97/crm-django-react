from django.db import transaction
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from activity_logs.models import ActivityLog
from activity_logs.services import record_activity
from .models import Company
from .pagination import CompanyPagination
from .permissions import CompanyRolePermission
from .serializers import CompanySerializer


class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, CompanyRolePermission]
    pagination_class = CompanyPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'industry', 'country']
    ordering_fields = ['name', 'industry', 'country', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Company.objects.for_organization(
            self.request.user.organization,
        ).filter(
            is_deleted=False,
        )

    @transaction.atomic
    def perform_create(self, serializer):
        company = serializer.save(organization=self.request.user.organization)
        record_activity(
            user=self.request.user,
            organization=self.request.user.organization,
            action=ActivityLog.Action.CREATE,
            instance=company,
        )

    @transaction.atomic
    def perform_update(self, serializer):
        company = serializer.save()
        record_activity(
            user=self.request.user,
            organization=self.request.user.organization,
            action=ActivityLog.Action.UPDATE,
            instance=company,
        )

    @transaction.atomic
    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save(update_fields=['is_deleted'])
        record_activity(
            user=self.request.user,
            organization=self.request.user.organization,
            action=ActivityLog.Action.DELETE,
            instance=instance,
        )