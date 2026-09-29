from rest_framework import serializers

from companies.models import Company

from .models import Contact


class ContactSerializer(serializers.ModelSerializer):
    company = serializers.PrimaryKeyRelatedField(queryset=Company.objects.none())
    phone = serializers.CharField(
        max_length=15,
        required=False,
        allow_blank=True,
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            self.fields['company'].queryset = Company.objects.for_organization(
                request.user.organization,
            ).filter(
                is_deleted=False,
            )

    def validate_email(self, value):
        return value.strip().casefold()

    def validate_phone(self, value):
        if value and (not value.isascii() or not value.isdigit()):
            raise serializers.ValidationError('Phone must contain digits only.')
        if value and not 8 <= len(value) <= 15:
            raise serializers.ValidationError('Phone must contain 8 to 15 digits.')
        return value

    def validate(self, attrs):
        email = attrs.get('email', getattr(self.instance, 'email', None))
        company = attrs.get('company', getattr(self.instance, 'company', None))
        if email and company:
            duplicates = Contact.objects.filter(company=company, email__iexact=email)
            if self.instance:
                duplicates = duplicates.exclude(pk=self.instance.pk)
            if duplicates.exists():
                raise serializers.ValidationError({
                    'email': 'A contact with this email already exists for this company.'
                })
        return attrs

    class Meta:
        model = Contact
        fields = '__all__'
        read_only_fields = ('id', 'organization', 'created_at', 'is_deleted')