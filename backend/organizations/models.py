import uuid

from django.db import models


class Organization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class SubscriptionPlan(models.TextChoices):
        BASIC = 'basic', 'Basic'
        PRO = 'pro', 'Pro'

    name = models.CharField(max_length=255)
    subscription_plan = models.CharField(
        max_length=10,
        choices=SubscriptionPlan.choices,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name