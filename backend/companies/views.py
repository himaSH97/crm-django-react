from django.db import transaction
from rest_framework import filters, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from activity_logs.models import ActivityLog
from activity_logs.services import record_activity
from .models import Company
from .pagination import CompanyPagination
from .permissions import CompanyRolePermission
from .serializers import CompanySerializer
from .storage import (
    ALLOWED_LOGO_TYPES,
    MAX_LOGO_BYTES,
    create_presigned_logo_upload,
    delete_company_logo,
)


class LogoUploadRequestSerializer(serializers.Serializer):
    content_type = serializers.ChoiceField(choices=tuple(ALLOWED_LOGO_TYPES))
    size = serializers.IntegerField(min_value=1, max_value=MAX_LOGO_BYTES)


class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, CompanyRolePermission]
    pagination_class = CompanyPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'industry', 'country']
    ordering_fields = ['name', 'industry', 'country', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Company.objects.for_organization(
            self.request.user.organization,
        ).filter(
            is_deleted=False,
        )
        industry = self.request.query_params.get('industry', '').strip()
        country = self.request.query_params.get('country', '').strip()

        if industry:
            queryset = queryset.filter(industry__iexact=industry)
        if country:
            queryset = queryset.filter(country__iexact=country)

        return queryset

    @action(detail=False, methods=['post'], url_path='logo-upload')
    def logo_upload(self, request):
        request_serializer = LogoUploadRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        upload = create_presigned_logo_upload(
            organization_id=request.user.organization_id,
            **request_serializer.validated_data,
        )
        return Response(upload, status=status.HTTP_201_CREATED)

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
        old_logo_key = serializer.instance.logo.name
        company = serializer.save()
        new_logo_key = company.logo.name
        if old_logo_key != new_logo_key:
            transaction.on_commit(
                lambda: delete_company_logo(
                    old_logo_key,
                    company.organization_id,
                )
            )
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