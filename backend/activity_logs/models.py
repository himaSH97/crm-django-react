import uuid

from django.conf import settings
from django.db import models


class ActivityLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Action(models.TextChoices):
        CREATE = 'create', 'CREATE'
        UPDATE = 'update', 'UPDATE'
        DELETE = 'delete', 'DELETE'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='activity_logs',
    )
    action = models.CharField(max_length=6, choices=Action.choices)
    model_name = models.CharField(max_length=100)
    object_id = models.UUIDField()
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f'{self.action} {self.model_name} {self.object_id}'