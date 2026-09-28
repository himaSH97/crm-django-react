from django.db import models


class TenantQuerySet(models.QuerySet):
    def for_organization(self, organization):
        if organization is None:
            return self.none()
        return self.filter(organization=organization)


TenantManager = models.Manager.from_queryset(TenantQuerySet)