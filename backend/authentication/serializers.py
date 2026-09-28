from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.password_validation import validate_password as validate_user_password
from rest_framework import serializers

from users.models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'organization',
            'role',
            'password',
        )
        read_only_fields = ('id', 'role')

    def validate_password(self, value):
        try:
            validate_user_password(value)
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            role=User.Role.STAFF,
            **validated_data,
        )