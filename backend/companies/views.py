from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Company
from .permissions import CompanyRolePermission
from .serializers import CompanySerializer


class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, CompanyRolePermission]

    def get_queryset(self):
        return Company.objects.filter(
            organization=self.request.user.organization,
            is_deleted=False,
        )

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

    def destroy(self, request, *args, **kwargs):
        company = self.get_object()
        company.is_deleted = True
        company.save(update_fields=['is_deleted'])
        return Response(status=status.HTTP_204_NO_CONTENT)