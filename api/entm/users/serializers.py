
# -*- coding: utf-8 -*-
from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from django.conf import settings
from accounts.models import User,MyRoles
from django.utils.translation import ugettext_lazy as _
from rest_framework import serializers, exceptions
from rest_framework.exceptions import ValidationError

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('user_name','real_name','sex','phone_number','expire_date','Role','idstr','uuid','is_active','belongto')


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer For Creating A Organization For Logged In Users"""

    class Meta:
        model = User
        fields = ('user_name','real_name','sex','phone_number','expire_date','Role','idstr','uuid','is_active','belongto')


class UserListSerializer(serializers.ModelSerializer):
    """Serializer For Listing Only Relevant Information
    Of Posts Of A Particular User"""

    # total_comments = serializers.IntegerField()

    class Meta:
        model = User
        fields = ('user_name','real_name','sex','phone_number','expire_date','Role','idstr','uuid','is_active','belongto')

class UserDetailSerializer(serializers.ModelSerializer):
    """Serializer For Listing Only Relevant Information
    Of Posts Of A Particular User"""

    # total_comments = serializers.IntegerField()

    class Meta:
        model = User
        fields = ('user_name','real_name','sex','phone_number','expire_date','Role','idstr','uuid','is_active','belongto')

class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer For Creating A Organization For Logged In Users"""

    class Meta:
        model = User
        fields = ('user_name','real_name','sex','phone_number','expire_date','Role','idstr','uuid','is_active','belongto')


class UserLoginSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        extra_kwargs = {
            'password': {
                'write_only': True
            },
            'user_name': {
                'read_only': True
            }

        }
        fields = [ 'user_name', 'password']

    def validate(self, data):
        return data


# from rest_auth
class LoginSerializer(serializers.Serializer):
    user_name = serializers.CharField(required=False, allow_blank=True)
    # email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(style={'input_type': 'password'})

    def authenticate(self, **kwargs):
        return authenticate(self.context['request'], **kwargs)

    def _validate_user_name(self, user_name, password):
        user = None
        print(user_name,password)
        if user_name and password:
            user = self.authenticate(username=user_name, password=password)
        else:
            msg = _('Must include "user_name" and "password".')
            raise exceptions.ValidationError(msg)

        return user

    def validate(self, attrs):
        username = attrs.get('user_name')
        password = attrs.get('password')

        user = None

        if 'allauth' in settings.INSTALLED_APPS:
            from allauth.account import app_settings

            # Authentication through email
            # if app_settings.AUTHENTICATION_METHOD == app_settings.AuthenticationMethod.EMAIL:
            #     user = self._validate_email(email, password)

            # Authentication through username
            if app_settings.AUTHENTICATION_METHOD == app_settings.AuthenticationMethod.USERNAME:
                user = self._validate_user_name(username, password)

            # Authentication through either username or email
            # else:
            #     user = self._validate_username_email(username, email, password)

        else:
            # Authentication without using allauth
            # if email:
            #     try:
            #         username = UserModel.objects.get(email__iexact=email).get_username()
            #     except UserModel.DoesNotExist:
            #         pass

            if username:
                user = self._validate_username_email(username, '', password)

        # Did we get back an active user?
        if user:
            if not user.is_active:
                msg = _('User account is disabled.')
                raise exceptions.ValidationError(msg)
        else:
            msg = _('Unable to log in with provided credentials.')
            raise exceptions.ValidationError(msg)

        # If required, is the email verified?
        if 'rest_auth.registration' in settings.INSTALLED_APPS:
            from allauth.account import app_settings
            if app_settings.EMAIL_VERIFICATION == app_settings.EmailVerificationMethod.MANDATORY:
                email_address = user.emailaddress_set.get(email=user.email)
                if not email_address.verified:
                    raise serializers.ValidationError(_('E-mail is not verified.'))

        attrs['user'] = user
        return attrs