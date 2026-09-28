from .models import ActivityLog


def record_activity(*, user, organization, action, instance):
    return ActivityLog.objects.create(
        user=user,
        organization=organization,
        action=action,
        model_name=instance._meta.object_name,
        object_id=instance.pk,
    )