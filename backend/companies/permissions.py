from users.permissions import RoleBasedResourcePermission


class CompanyRolePermission(RoleBasedResourcePermission):
    resource = 'company'