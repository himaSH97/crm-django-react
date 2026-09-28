import uuid

from django.core.exceptions import ValidationError
from django.db import models


class Contact(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='contacts',
    )
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='contacts',
    )
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=32, blank=True)
    role = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['company', 'email'],
                name='unique_contact_email_per_company',
            ),
        ]
        indexes = [
            models.Index(fields=['organization', 'is_deleted']),
        ]

    def clean(self):
        super().clean()
        if self.company_id and self.organization_id:
            company_organization_id = self.company.organization_id
            if company_organization_id != self.organization_id:
                raise ValidationError({
                    'organization': 'Contact and company must belong to the same organization.'
                })

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.full_name