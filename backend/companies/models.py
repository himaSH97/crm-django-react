import uuid
from pathlib import Path

from django.db import models

from organizations.managers import TenantManager


def company_logo_upload_to(instance, filename):
    if not instance.organization_id:
        raise ValueError('Company logos require an organization.')

    suffix = Path(filename).suffix.lower()
    if suffix not in {'.jpg', '.jpeg', '.png', '.webp'}:
        suffix = ''

    return (
        f'company-logos/{instance.organization_id}/'
        f'{uuid.uuid4().hex}{suffix}'
    )


class Company(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    objects = TenantManager()

    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='companies',
    )
    name = models.CharField(max_length=255)
    industry = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    logo = models.ImageField(upload_to=company_logo_upload_to)
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=['organization', 'is_deleted']),
        ]

    def __str__(self):
        return self.name