from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Contact
from .permissions import ContactRolePermission
from .serializers import ContactSerializer


class ContactViewSet(viewsets.ModelViewSet):
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated, ContactRolePermission]

    def get_queryset(self):
        return Contact.objects.filter(
            organization=self.request.user.organization,
            is_deleted=False,
        )

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

    def destroy(self, request, *args, **kwargs):
        contact = self.get_object()
        contact.is_deleted = True
        contact.save(update_fields=['is_deleted'])
        return Response(status=status.HTTP_204_NO_CONTENT)