from rest_framework.permissions import BasePermission


ROLE_PERMISSIONS = {
    'admin': {
        'company:read',
        'company:create',
        'company:update',
        'company:delete',
        'contact:read',
        'contact:create',
        'contact:update',
        'contact:delete',
    },
    'manager': {
        'company:read',
        'company:create',
        'company:update',
        'contact:read',
        'contact:create',
        'contact:update',
    },
    'staff': {
        'company:read',
        'company:create',
        'contact:read',
        'contact:create',
    },
}


class RoleBasedResourcePermission(BasePermission):
    resource = None
    action_permissions = {
        'list': 'read',
        'retrieve': 'read',
        'create': 'create',
        'update': 'update',
        'partial_update': 'update',
        'destroy': 'delete',
        'metadata': 'read',
    }

    def has_permission(self, request, view):
        action = getattr(view, 'action', None)
        operation = self.action_permissions.get(action)
        if operation is None or self.resource is None:
            return False

        permission = f'{self.resource}:{operation}'
        return permission in ROLE_PERMISSIONS.get(
            getattr(request.user, 'role', None),
            set(),
        )