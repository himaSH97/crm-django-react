from django.db import transaction
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from activity_logs.models import ActivityLog
from activity_logs.services import record_activity
from .models import Contact
from .pagination import ContactPagination
from .permissions import ContactRolePermission
from .serializers import ContactSerializer


class ContactViewSet(viewsets.ModelViewSet):
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated, ContactRolePermission]
    pagination_class = ContactPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['full_name', 'email', 'phone', 'role']
    ordering_fields = ['full_name', 'email', 'created_at']
    ordering = ['full_name']

    def get_queryset(self):
        queryset = Contact.objects.for_organization(
            self.request.user.organization,
        ).filter(
            is_deleted=False,
        )
        company_id = self.request.query_params.get('company')
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        return queryset

    @transaction.atomic
    def perform_create(self, serializer):
        contact = serializer.save(organization=self.request.user.organization)
        record_activity(
            user=self.request.user,
            organization=self.request.user.organization,
            action=ActivityLog.Action.CREATE,
            instance=contact,
        )

    @transaction.atomic
    def perform_update(self, serializer):
        contact = serializer.save()
        record_activity(
            user=self.request.user,
            organization=self.request.user.organization,
            action=ActivityLog.Action.UPDATE,
            instance=contact,
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