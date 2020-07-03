# -*- coding: utf-8 -*-
from django.contrib.auth import (
    login as django_login,
    logout as django_logout
)
from django.shortcuts import render,redirect
from django.conf import settings
from rest_framework import generics 
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from django.core.exceptions import ObjectDoesNotExist
from django.utils.decorators import method_decorator
from rest_framework.generics import GenericAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.views.decorators.debug import sensitive_post_parameters

from .serializers import UserListSerializer, UserDetailSerializer,UserSerializer,UserLoginSerializer,LoginSerializer
from accounts.models import User


sensitive_post_parameters_m = method_decorator(
    sensitive_post_parameters(
        'password', 'old_password', 'new_password1', 'new_password2'
    )
)


class UserListView(generics.ListAPIView):
    """View For List All Published User"""

    queryset = User.objects.all()
    serializer_class = UserListSerializer


class UserDetailView(generics.RetrieveAPIView):
    """View For The Details Of A Single User"""

    queryset = User.objects.all()
    serializer_class = UserDetailSerializer

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows User to be viewed or edited.
    """
    queryset = User.objects.all()   #.order_by('-date_joined')
    serializer_class = UserSerializer

class UserLoginView(APIView):
    # permission_classes = [AllowAny,]
    serializer_class = UserLoginSerializer
    def post(self, request, *args, **kwargs):
        data = request.data
        serializer = UserLoginSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            new_data = serializer.data
            print(serializer)
            print('serializer data:',serializer.data)
            return Response(new_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class LoginView(generics.GenericAPIView):
    """
    Check the credentials and return the REST Token
    if the credentials are valid and authenticated.
    Calls Django Auth login method to register User ID
    in Django session framework

    Accept the following POST parameters: username, password
    Return the REST Framework Token Object's key.
    """
    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer
    # token_model = TokenModel

    @sensitive_post_parameters_m
    def dispatch(self, *args, **kwargs):
        return super(LoginView, self).dispatch(*args, **kwargs)

    def process_login(self):
        django_login(self.request, self.user)

    
    def login(self):
        self.user = self.serializer.validated_data['user']

        # if getattr(settings, 'REST_USE_JWT', False):
        #     self.token = jwt_encode(self.user)
        # else:
        #     self.token = create_token(self.token_model, self.user,
        #                               self.serializer)

        if getattr(settings, 'REST_SESSION_LOGIN', True):
            self.process_login()

    def get(self, request):
        try:
            username = request.query_params.get('user_name')
            password = request.query_params.get('password')
            if not username or not password:
                return Response({'message': '用户名和密码是必填的。', 'status': status.HTTP_400_BAD_REQUEST})
            user = User.objects.get(password=0, username=username)
            if user.check_password(raw_password=password):
                serializer = UserProfileSerializer(user)
                # request.user = user
                login(request, user)
                return Response({'message': '登录成功', 'csrf': request.session, 'status': status.HTTP_200_OK,
                                 'data': serializer.data})
            return Response({'status': status.HTTP_400_BAD_REQUEST, 'message': '密码错误'})
        except UserProfile.DoesNotExist:
            return Response({'message': '当前账号不存在', 'status': status.HTTP_400_BAD_REQUEST})

    
    def post(self, request, *args, **kwargs):
        self.request = request
        self.serializer = self.get_serializer(data=self.request.data,
                                              context={'request': request})
        try:                                              
            self.serializer.is_valid(raise_exception=True)
        except Exception as e:
            print('adfas:',e)
            return Response(self.serializer.errors,status.HTTP_400_BAD_REQUEST,template_name='index.html')

        print('??:',self.serializer.data)
        print('??:',self.serializer.errors)

        self.login()
        # next_path = self.get_next_url()
        # if next_path is not None:
        #     return redirect(to=next_path)
        return redirect(to='/home/')
        # return Response(self.serializer.data, status=status.HTTP_200_OK)
        # return self.get_response()