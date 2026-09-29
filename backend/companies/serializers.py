from rest_framework import serializers

from .models import Company
from .storage import finalize_pending_logo, is_pending_logo_key


class CompanySerializer(serializers.ModelSerializer):
    logo = serializers.ImageField(read_only=True)
    logo_key = serializers.CharField(write_only=True, required=False)

    def validate_logo_key(self, key):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        organization_id = getattr(user, 'organization_id', None)
        if not is_pending_logo_key(key, organization_id):
            raise serializers.ValidationError('Invalid or expired logo upload.')
        return key

    def validate(self, attrs):
        if self.instance is None and 'logo_key' not in attrs:
            raise serializers.ValidationError({'logo_key': 'Upload a logo first.'})
        return attrs

    def create(self, validated_data):
        pending_key = validated_data.pop('logo_key')
        organization = validated_data['organization']
        validated_data['logo'] = finalize_pending_logo(
            pending_key,
            organization.pk,
        )
        return super().create(validated_data)

    def update(self, instance, validated_data):
        pending_key = validated_data.pop('logo_key', None)
        if pending_key:
            validated_data['logo'] = finalize_pending_logo(
                pending_key,
                instance.organization_id,
            )
        return super().update(instance, validated_data)

    class Meta:
        model = Company
        fields = (
            'id', 'organization', 'name', 'industry', 'country', 'logo',
            'logo_key', 'created_at', 'is_deleted',
        )
        read_only_fields = ('id', 'organization', 'created_at', 'is_deleted')