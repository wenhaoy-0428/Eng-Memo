from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
import re


#Serializer to Register User
class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="A user with that email already exists.")]
    )
    password = serializers.CharField(required=True, write_only=True, validators=[validate_password])

    def validate_username(self, value):
        if not re.match('^[a-zA-Z][a-zA-Z0-9-_]{3,23}$', value):
            raise serializers.ValidationError("The username is invalid.")
        return value
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    # create is defined to enable serializer to create instance
    def create(self, validated_data):
        user = User.objects.create_user(validated_data['username'], validated_data['email'], validated_data['password'])
        return user