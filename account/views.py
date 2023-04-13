from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import RegisterSerializer, LoginSerializer
from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout

class Register(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    # def post(self, request, *args, **kwargs):
    #     serializer = self.get_serializer(data=request.data)
    #     serializer.is_valid(raise_exception=True)
    #     user = serializer.save()
    #     return Response()

class Login(APIView):

    def post(self, request, format=None):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user = authenticate(email=email, password=password)
            if user is not None:
                login(request, user)
                return Response(data={'success': 'User Authenticated.'})
            else:
                return Response(data={'password': ["Username and password don't match or username doesn't exist."]}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 

class Logout(APIView):
    def post(self, request, format=None):
        try:
            logout(request)
            return Response('User successfully logged out.')
        except:
            return Response('Something went wrong', status=status.HTTP_400_BAD_REQUEST)