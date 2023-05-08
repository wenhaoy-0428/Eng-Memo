import json
from datetime import date, timedelta

from django.test import TestCase, RequestFactory
from django.contrib.auth.models import User
from rest_framework.test import APIClient, APIRequestFactory, force_authenticate
from rest_framework import status

from .models import Record, Word
from . import global_param

from . import views


TEST_USER_NAME = "testuser"


class TEST_GenerateReviewPlanView(TestCase):
    API_PATH = "/api/generateReviewPlan/"

    @classmethod
    def setUpClass(cls):
        # Set up a test user.
        cls.user = User.objects.create(username=TEST_USER_NAME)
        cls.word = Word.objects.create(value="hello")
        Record.objects.create(user_id=cls.user, word_id=cls.word, last_planed=(date.today()- timedelta(days=1)))
    
    @classmethod
    def tearDownClass(cls):
        cls.user.delete()
        cls.word.delete()
    
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
            Record.objects.create(user_id=user, word_id=word, last_planed=(date.today()- timedelta(days=1)))
        client = APIClient()
        client.force_authenticate(user=user)
        # check number of planed reviews is none before making requests
        self.assertEqual(Record.objects.filter(user_id=user, last_planed=date.today()).count(), 0)
        response = client.post(self.API_PATH)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Record.objects.filter(user_id=user, last_planed=date.today()).count(), global_param.NUM_REVIEW_RECORDS_PER_DAY)
        
class TEST_NewRecordView(TestCase):
    API_PATH_GENERATE_REVIEW_PLAN = "/api/generateReviewPlan/"
    API_PATH_NEW_RECORD = "/api/newRecord/"
    API_PATH_GET_NUM_PENDING_REVIEWS = "/api/get-num-pending-reviews/"

    
    def setUp(self):
        # Set up a test user.
        self.user = User.objects.create(username=TEST_USER_NAME)
        word = Word.objects.create(value="hello")
        self.factory = RequestFactory()
        self.apiFactory = APIRequestFactory()
        Record.objects.create(user_id=self.user, word_id=word, last_planed=(date.today()- timedelta(days=1)))
    

    def test_0001(self):
        """__Test adding new record increases the number of pending reviews.__
        Expect: NumPendingReviews is 0 before adding new record, and 1 after done.
        """
        data = {
            'link': "",
            'quote': "",
            'tag': "",
            'word': "helpme"
        }
        requestNumPendingReviews = self.factory.get(self.API_PATH_GET_NUM_PENDING_REVIEWS)
        requestNumPendingReviews.user = self.user
        response = views.GetNumPendingReviews.as_view()(requestNumPendingReviews)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, 0)


        requestNewRecord = self.factory.post(self.API_PATH_NEW_RECORD, data, content_type='application/json')
        requestNewRecord.user = self.user
        response = views.NewRecord(requestNewRecord)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = views.GetNumPendingReviews.as_view()(requestNumPendingReviews)
        self.assertEqual(response.data, 1)

    def test_0002(self):
        """__Test adding new record increases the number of pending reviews when review plan is generated__
        """
        # check default num pending reviews.
        requestNumPendingReviews = self.factory.get(self.API_PATH_GET_NUM_PENDING_REVIEWS)
        requestNumPendingReviews.user = self.user
        response = views.GetNumPendingReviews.as_view()(requestNumPendingReviews)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, 0)

        # generate plan
        requestGenPlan = self.apiFactory.post(self.API_PATH_GENERATE_REVIEW_PLAN)
        force_authenticate(requestGenPlan, user=self.user)
        response = views.GenerateReviewPlan.as_view()(requestGenPlan)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # check num pending reviews after plan generated.
        response = views.GetNumPendingReviews.as_view()(requestNumPendingReviews)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, 1)

        data = {
            'link': "",
            'quote': "",
            'tag': "",
            'word': "helpme"
        }
        requestNewRecord = self.factory.post(self.API_PATH_NEW_RECORD, data, content_type='application/json')
        requestNewRecord.user = self.user
        response = views.NewRecord(requestNewRecord)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = views.GetNumPendingReviews.as_view()(requestNumPendingReviews)
        self.assertEqual(response.data, 2)