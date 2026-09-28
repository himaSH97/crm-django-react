from users.permissions import RoleBasedResourcePermission


class ContactRolePermission(RoleBasedResourcePermission):
    resource = 'contact'