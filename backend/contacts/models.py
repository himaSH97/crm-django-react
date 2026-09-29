import uuid

from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models
from django.db.models import F
from django.db.models.functions import Lower

from organizations.managers import TenantManager


class Contact(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    objects = TenantManager()

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
    phone = models.CharField(
        max_length=15,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^\d{8,15}$',
                message='Phone must contain 8 to 15 digits.',
            ),
        ],
    )
    role = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                F('company'),
                Lower('email'),
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