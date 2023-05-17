from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.utils.decorators import method_decorator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.views.decorators.csrf import csrf_protect
from django.template.loader import render_to_string

from rest_framework.views import APIView
from rest_framework import status, permissions
from rest_framework.response import Response

from .serializers import RegisterSerializer, LoginSerializer, AvatarSerializer
from .email.accountActivation import sendAccountActivationEmail, email_verification_token_generator
from django.views.decorators.csrf import csrf_exempt
from .models import UserProfile


class TestViewSendActivationEmail(APIView):
    permission_classes = [permissions.AllowAny,]

    def get(self, request, format=None):
        # ! TestView that uses super user.
        user = User.objects.get(username="hao")
        return Response(sendAccountActivationEmail(user, request))


class ActivateAccount(APIView):
    permission_classes = [permissions.AllowAny,]

    def get(self, request, uidb64, token, format=None):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except:
            user = None
        if user is None:
            # invalid user
            return render(request, "error.html", {"code": status.HTTP_404_NOT_FOUND})
        elif email_verification_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            # todo: redirect to login page.
            return redirect("https://www.whyprojects.tech/")
        elif user.is_active is False:
            # token expired
            sendAccountActivationEmail(user, request)
            return render(request, "error.html", {"message": "The activation email has expired, a new email has been sent please check your email now."})
        # token modified
        return Response(status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_protect, name="dispatch")
class Register(APIView):
    """_Register_

    Args: {username: ^[a-zA-Z][a-zA-Z0-9-_]{3,23}$,
           email: unique, valid,
           password: ^(?=.*[A-Z])(?=.*[a-z])(?=.*[@#$%!^&*]){8,24}
           }

    Returns:
        _type_: _description_
    """
    permission_classes = [permissions.AllowAny,]
    serializer_class = RegisterSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        if sendAccountActivationEmail(user, request) != 1:
            user.delete()
            return Response({"error": "Email unreachable or unexpected error occurred when sending email"},
                            status=status.HTTP_406_NOT_ACCEPTABLE)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@method_decorator(csrf_protect, name="dispatch")
class Login(APIView):
    # allows no csrf token check, allows
    permission_classes = [permissions.AllowAny,]

    def post(self, request, format=None):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        user = authenticate(email=email, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return Response(data={'success': 'User Authenticated.'})
            else:
                # resend email
                sendAccountActivationEmail(user, request)
                return Response(data={'error': "Inactivated User. Please check your email box to activate your account."}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response(data={'password': ["Username and password don't match or username doesn't exist."]}, status=status.HTTP_401_UNAUTHORIZED)


class Logout(APIView):
    def post(self, request, format=None):
        try:
            logout(request)
            return Response('User successfully logged out.')
        except:
            return Response('Something went wrong', status=status.HTTP_400_BAD_REQUEST)


class UploadAvatar(APIView):
    def post(self, request, format=None):
        serializer = AvatarSerializer(data=request.data)
        if serializer.is_valid():
            avatar = serializer.validated_data['avatar']
            instance = None
            try:
                instance = UserProfile.objects.get(user=request.user)
                if instance.avatar:
                    instance.avatar.delete()
                instance.avatar = avatar
                instance.save()
            except UserProfile.DoesNotExist:
                instance = UserProfile.objects.create(user=request.user, avatar=avatar)
            return Response(instance.avatar.url, status=201)
        return Response(serializer.errors, status=400)
