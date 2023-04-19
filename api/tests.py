from datetime import date

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from .models import Record, Word
from . import global_param


TEST_USER_NAME = "testuser"


class TEST_GenerateReviewPlanView(TestCase):
    API_PATH = "/api/generateReviewPlan/"

    @classmethod
    def setUpClass(cls):
        # Set up a test user.
        user = User.objects.create(username=TEST_USER_NAME)
        word = Word.objects.create(value="hello")
        Record.objects.create(user_id=user, word_id=word)
    
    @classmethod
    def tearDownClass(cls):
        pass
    
    def test_0001(self):
        """ __Test user call this API when no generated plan__
        Expect: Return status 201_CREATED.
        """
        user = User.objects.get(username=TEST_USER_NAME)
        client = APIClient()
        client.force_authenticate(user=user)
        response = client.post(self.API_PATH)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_0002(self):
        """__Test anonymous user should not be able to call this API__
        Expect: Return status 403.
        """
        client = APIClient()
        response = client.post(self.API_PATH)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_0003(self):
        """__Test this API is CSRF token protected__
        Expect: return status 403.
        """
        client = APIClient(enforce_csrf_checks=True)
        response = client.post(self.API_PATH)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_0004(self):
        """__Test user call this API when no generated plan with available records are below planed number__
        Expect: return status 401_created, number of records marked as reviewing is the same as counts.
        """
        user = User.objects.get(username=TEST_USER_NAME)
        client = APIClient()
        client.force_authenticate(user=user)
        # check number of planed reviews is none before making requests
        self.assertEqual(Record.objects.filter(user_id=user, last_planed=date.today()).count(), 0)
        response = client.post(self.API_PATH)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Record.objects.filter(user_id=user, last_planed=date.today()).count(), 1)

    def test_0005(self):
        """__Test user call this API when no generated plan with available records are more than planed number__
        Expect: return status 401_created, number of records marked is the same as planned number.
        """
        user = User.objects.get(username=TEST_USER_NAME)
        for i in range(200):
            word = Word.objects.create(value="testWord" + str(i))
            Record.objects.create(user_id=user, word_id=word)
        client = APIClient()
        client.force_authenticate(user=user)
        # check number of planed reviews is none before making requests
        self.assertEqual(Record.objects.filter(user_id=user, last_planed=date.today()).count(), 0)
        response = client.post(self.API_PATH)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Record.objects.filter(user_id=user, last_planed=date.today()).count(), global_param.NUM_REVIEW_RECORDS_PER_DAY)
        