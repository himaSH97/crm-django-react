from rest_framework.permissions import BasePermission

from users.models import User


class ActivityLogReadPermission(BasePermission):
    allowed_roles = {User.Role.ADMIN, User.Role.MANAGER}

    def has_permission(self, request, view):
        return getattr(request.user, 'role', None) in self.allowed_roles