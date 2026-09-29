from users.permissions import RoleBasedResourcePermission


class CompanyRolePermission(RoleBasedResourcePermission):
    resource = 'company'

    action_permissions = {
        **RoleBasedResourcePermission.action_permissions,
        'logo_upload': 'create',
    }