from django.core import mail
from django.test import RequestFactory, TestCase
from django.contrib.auth.models import AnonymousUser, User

from rest_framework import status
from rest_framework.test import APIRequestFactory

from .email.accountActivation import sendAccountActivationEmail

from .views import Register

class Test_Register(TestCase):
    API_PATH = "api/account/register"

    def setUp(self):
        self.factory = RequestFactory()
        self.apiFactory = APIRequestFactory()
        self.user = User.objects.create_user(
            username="jacob", email="jacob@…", password="top_secret"
        )

    def test_0001(self):
        """__Test SendAccountActivationEmail successfully send email under normal condition__
        Expect: return is 1
        """
        request = self.factory.get(self.API_PATH)
        result = sendAccountActivationEmail(self.user, request)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIs(result, 1)
    
    def test_0002(self):
        """__Test user register under normal condition___
        Expect: return code 201.
        """
        data = {
            "username": "user_test",
            "email": "test@email.com",
            "password": "Test123@",
        }
        request = self.apiFactory.post(self.API_PATH, data)
        response = Register.as_view()(request)
        self.assertTrue(User.objects.get(username="user_test"))
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_0003(self):
        """__Test user register when username is less than 4 char___
        Expect: return code 400.
        """
        data = {
            "username": "t1",
            "email": "test@email.com",
            "password": "Test123@",
        }
        request = self.apiFactory.post(self.API_PATH, data)
        response = Register.as_view()(request)
        self.assertTrue(response.data['username'])
        self.assertEqual(len(mail.outbox), 0)
        self.assertFalse(User.objects.filter(username="user_test"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_0004(self):
        """__Test user register when username is more than 24 char___
        Expect: return code 400.
        """
        data = {
            "username": "t123456789123456789123456789",
            "email": "test@email.com",
            "password": "Test123@",
        }
        request = self.apiFactory.post(self.API_PATH, data)
        response = Register.as_view()(request)
        self.assertTrue(response.data['username'])
        self.assertEqual(len(mail.outbox), 0)
        self.assertFalse(User.objects.filter(username="user_test"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_0005(self):
        """__Test user register when username contains invalid symbol___
        Expect: return code 400.
        """
        data = {
            "username": "t1*",
            "email": "test@email.com",
            "password": "Test123@",
        }
        request = self.apiFactory.post(self.API_PATH, data)
        response = Register.as_view()(request)
        self.assertTrue(response.data['username'])
        self.assertEqual(len(mail.outbox), 0)
        self.assertFalse(User.objects.filter(username="user_test"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_0006(self):
        """__Test user register when email is invalid___
        Expect: return code 400.
        """
        data = {
            "username": "test1",
            "email": "test.email.com",
            "password": "Test123@",
        }
        request = self.apiFactory.post(self.API_PATH, data)
        response = Register.as_view()(request)
        self.assertTrue(response.data['email'])
        self.assertEqual(len(mail.outbox), 0)
        self.assertFalse(User.objects.filter(username="user_test"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_0007(self):
        """__Test user register when password less than 8 char___
        Expect: return code 400.
        """
        data = {
            "username": "test1",
            "email": "test@email.com",
            "password": "Test@",
        }
        request = self.apiFactory.post(self.API_PATH, data)
        response = Register.as_view()(request)
        self.assertTrue(response.data['password'])
        self.assertEqual(len(mail.outbox), 0)
        self.assertFalse(User.objects.filter(username="user_test"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_0008(self):
        """__Test user register when password more than 24 char___
        Expect: return code 400.
        """
        data = {
            "username": "test1",
            "email": "test@email.com",
            "password": "Test1231231231231231231231231@",
        }
        request = self.apiFactory.post(self.API_PATH, data)
        response = Register.as_view()(request)
        self.assertEqual(len(mail.outbox), 0)
        self.assertTrue(response.data['password'])
        self.assertFalse(User.objects.filter(username="user_test"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_0009(self):
        """__Test user register when password does not contain special char___
        Expect: return code 400.
        """
        data = {
            "username": "test1",
            "email": "test@email.com",
            "password": "Test@",
        }
        request = self.apiFactory.post(self.API_PATH, data)
        response = Register.as_view()(request)
        self.assertEqual(len(mail.outbox), 0)
        self.assertTrue(response.data['password'])
        self.assertFalse(User.objects.filter(username="user_test"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)