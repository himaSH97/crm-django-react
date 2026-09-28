import uuid

from django.db import models


class Company(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='companies',
    )
    name = models.CharField(max_length=255)
    industry = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    logo = models.ImageField(upload_to='company_logos/')
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=['organization', 'is_deleted']),
        ]

    def __str__(self):
        return self.name