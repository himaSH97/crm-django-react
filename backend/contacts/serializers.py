from rest_framework import serializers

from companies.models import Company

from .models import Contact


class ContactSerializer(serializers.ModelSerializer):
    company = serializers.PrimaryKeyRelatedField(queryset=Company.objects.none())

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            self.fields['company'].queryset = Company.objects.for_organization(
                request.user.organization,
            ).filter(
                is_deleted=False,
            )

    class Meta:
        model = Contact
        fields = '__all__'
        read_only_fields = ('id', 'organization', 'created_at', 'is_deleted')