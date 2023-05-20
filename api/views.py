import json

from datetime import date
from math import log
from random import random
from time import sleep

from django.contrib.auth.models import User
from django.db.models import Q
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie


from rest_framework.views import APIView
from rest_framework import status, permissions
from rest_framework.response import Response

from .forms import NewRecordForm
from .models import Word, Tag, Record, TagAssignment, Quote, Milestone
from .serializers import RecordSerializer, QuoteSerializer, SearchRecordSerializer, SearchWordTagSerializer, \
    GetMilestoneSerializer, MilestoneSerializer
from account.models import UserProfile
from . import global_param
from . import utils
from .libs.libs import GetLongestConsecutiveDays, GetRecentConsecutiveDays


def getPendingReviews(user):
    """Get all records of the user that are not yet reviewed today.
    Args:
        user (_type_): the user
    Returns:
        [Record]: 
    """
    return Record.objects.filter(~Q(reviewing_status=3), user_id=user, last_planed=date.today())


class GetNumPendingReviews(APIView):
    def get(self, request, format=None):
        allReviewingRecordsCount = getPendingReviews(request.user).count()
        return Response(allReviewingRecordsCount)


class GetUserContext(APIView):
    def get(self, request, format=None):
        milestoneSet = Milestone.objects.filter(
            user_id=request.user, completed=True).order_by("-plannedAt").values_list("plannedAt", flat=True)
        user = request.user
        allReviewingRecordsCount = getPendingReviews(user).count()
        avatarUrl = userProfile = None
        try:
            userProfile = UserProfile.objects.get(user=request.user)
            if userProfile.avatar:
                avatarUrl = userProfile.avatar.url
        except UserProfile.DoesNotExist:
            userProfile = UserProfile.objects.create(user=request.user)

        response = {
            "numPending": allReviewingRecordsCount,
            "username": user.username,
            "email": user.email,
            "avatar": avatarUrl,
            "longestStreak": GetLongestConsecutiveDays(milestoneSet),
            "streak": GetRecentConsecutiveDays(milestoneSet),
            "total": milestoneSet.count()
        }
        return Response(response)


def NewRecord(request):
    """ API handler that handles user enter new words
    Args:
        request.data: {
            "link": url,
            "quote": str,
            "tag": str,
            "word": str,
        } 

    Returns:
        response: The response of this API including the status
    """

    if request.method == 'POST':
        # Populate the form with received data
        form = NewRecordForm(json.loads(request.body))
        word = quote = link = tag = tagAssignment = record = None

        if form.is_valid():
            # get current user
            currentUser = User.objects.get(id=request.user.id)
            # save for Word
            inputWord = form.cleaned_data['word']
            # Note: word is required
            queryWord = Word.objects.filter(value=inputWord)
            if not queryWord.exists():
                word = Word(value=inputWord)
                word.save()
            else:
                # word is retrieved for Record
                word = queryWord[0]

            # save for Record
            queryRecord = Record.objects.filter(
                user_id=currentUser, word_id=word)
            if not queryRecord.exists():
                record = Record(user_id=currentUser, word_id=word)
                record.save()
            else:
                # record is retrieved for Quote
                record = queryRecord[0]

            # save for Tag
            inputTag = form.cleaned_data['tag']
            tagAssignment = None
            if inputTag:
                queryTag = Tag.objects.filter(value=inputTag)
                if (not queryTag.exists()):
                    tag = Tag(value=inputTag)
                    tag.save()
                else:
                    tag = queryTag[0]
                # save for TagAssignment
                """saving of TagAssignment happens only when:
                1. tag is entered
                2. tag is not yet bound to the user
                """
                queryTagAssignment = TagAssignment.objects.filter(
                    user_id=currentUser, tag_id=tag)
                if not queryTagAssignment.exists():
                    tagAssignment = TagAssignment(
                        user_id=currentUser, tag_id=tag)
                    tagAssignment.save()
                else:
                    tagAssignment = queryTagAssignment[0]

            # save for Quote
            inputQuote, inputLink = form.cleaned_data['quote'], form.cleaned_data['link']

            quote = Quote(tagAssignment_id=tagAssignment, record_id=record, value=inputQuote,
                          link=inputLink)
            quote.save()

    return HttpResponse(request.body)


class SyncReview(APIView):
    """
        Sync frontend with backend all reviewing records that were already sent to the frontend 
        before last page refresh.
    """

    def get(self, request, format=None):
        if 'reviewing_records' in request.session:
            return Response(request.session['reviewing_records'])
        return Response(status=status.HTTP_204_NO_CONTENT)


class GenerateReviewPlan(APIView):
    def initTodaysRecord(self, record):
        record.last_planed = date.today()
        record.reviewing_status = 2
        # Reset num reviewed
        record.num_reviewed = 0
        record.save()

    def calcSelectedProb(self, instance):
        date_since_added = (date.today() - instance.date_added).days
        # calculate decayed mastery
        decayedMastery = utils.calcDecayedMastery(instance)
        prob = 0.5 * (1 - decayedMastery) + 0.3 * (min(1, instance.num_reviewed / global_param.REVIEW_TIMES_DENOMINATOR)) \
            + 0.2 * (min(1,  date_since_added /
                     global_param.TIME_SINCE_ADDED_DENOMINATOR))
        return prob

    def post(self, request, format=None):
        # check if review records are generated
        recordQueryCount = Record.objects.filter(
            user_id=request.user, last_planed=date.today()).count()
        if recordQueryCount != 0:
            return Response({"success": "Already Generated"}, status=status.HTTP_200_OK)
        # Generate reviewing records
        recordQuery = Record.objects.filter(user_id=request.user).all()
        # if review requirement is more than database size
        if recordQuery.count() < global_param.NUM_REVIEW_RECORDS_PER_DAY:
            for record in recordQuery:
                self.initTodaysRecord(record)
        else:
            # https://stackoverflow.com/questions/2140787/select-k-random-elements-from-a-list-whose-elements-have-weights
            """
                Randomly sampling from Exponential Distribution with Weight as lambda.
            """
            def randomSampleWithWeightFromExpoDistr(record):
                # tuple(record, sample)
                return (record, -log(random())/self.calcSelectedProb(record))
            expoSamples = list(
                map(randomSampleWithWeightFromExpoDistr, recordQuery))
            # select the n minimum samples as candidates
            candidates = sorted(expoSamples, key=lambda x: x[1])[
                :global_param.NUM_REVIEW_RECORDS_PER_DAY]
            for sample in candidates:
                candidate = sample[0]
                self.initTodaysRecord(candidate)
        # To make sure the loading screen is on
        sleep(1.5)
        # create milestone instance for the user
        Milestone.objects.create(user_id=request.user)
        return Response({"success": "Generated"}, status=status.HTTP_201_CREATED)


class GetReview(APIView):
    """
        Fetches all entries that are currently being reviewed, or generate entries to be reviewed.
    """

    def get(self, request, format=None):

        if Record.objects.filter(user_id=request.user).count() == 0:
            # when the user is new and has no records at all
            return Response(status=status.HTTP_204_NO_CONTENT)

        if 'reviewing_records' not in request.session:
            # select from generated reviewing records
            reviewRecords = getPendingReviews(request.user)
            # send only data only within the window size
            data = RecordSerializer(
                reviewRecords[0:global_param.REVIEW_WINDOW_SIZE], many=True).data
            request.session['reviewing_records'] = data
        else:
            # select from generated reviewing records that are not currently reviewing (inside )
            reviewRecords = getPendingReviews(request.user)\
                .exclude(pk__in=[record['pk'] for record in request.session['reviewing_records']])
            data = RecordSerializer(
                reviewRecords[0:global_param.REVIEW_WINDOW_SIZE], many=True).data
            request.session['reviewing_records'] += data

        request.session.modified = True
        return Response(data)


class GetLibrary(APIView):
    """ 
        Fetches all entries belong to current user.
    """

    def get(self, request, format=None):
        records = Record.objects.filter(user_id=request.user)

        data = RecordSerializer(records, many=True).data
        return Response(data)


class UpdateQuote(APIView):
    def patch(self, request, format=None):
        """ Update the content of a specific quote.
        Args:
            request: Accepts JSON input in the format 
            {
                key: The primary key of the quote.
                value: The new quote to replace the old one
            }

        Returns:
           Accepts when the input is valid and rejects with code 400 otherwise.
        """
        quoteSet = Quote.objects.filter(id=request.data['key'])
        serializer = QuoteSerializer(data=request.data)
        if serializer.is_valid():
            if quoteSet.exists():
                quote = quoteSet[0]
                quote.value = serializer.data['value']
                quote.save(update_fields=['value'])
                return Response(status=status.HTTP_202_ACCEPTED)
        return Response(status=status.HTTP_400_BAD_REQUEST)


class DeleteQuotes(APIView):
    def put(self, request, format=None):
        """Delete an array of specified quotes
        Args:
            request: Accepts JSON input in the format of
            [pk1, pk2, pk3...]

        Returns:
            _type_: _description_
        """
        quotesToDelete = Quote.objects.filter(pk__in=request.data)
        quotesToDelete.delete()
        return Response()


class UpdateReviewingRecordStatus(APIView):
    """
        Update the today's status of specified record.
        The request should have the format as follows:
        {
            pk: *,
            status: *,
        }
    """

    def patch(self, request, format=None):
        record = Record.objects.get(pk=request.data['pk'])
        # Mark as not reviewing, meaning frontend now doesn't contain this record
        request.session['reviewing_records'] = list(filter(
            lambda x: x['pk'] != request.data['pk'], request.session['reviewing_records']))
        record.num_reviewed += 1
        reviewStatus = request.data['status']
        # < 3 is a safety guard
        if reviewStatus == global_param.STATUS_KW and record.reviewing_status < 3:
            record.reviewing_status += 1
            if (record.reviewing_status == 3):
                # update mastery when pass with decayed value and increments
                record.mastery = utils.calcDecayedMastery(
                    record) + global_param.MASTERY_INCREMENT * (1 / record.num_reviewed)
                record.last_reviewed = date.today()

        elif reviewStatus == global_param.STATUS_UC:
            record.reviewing_status = 1
        elif reviewStatus == global_param.STATUS_DN:
            record.reviewing_status = 0
        record.save()

        allReviewingRecords = getPendingReviews(request.user)
        data = None
        # mark more records as reviewing if necessary
        if (len(request.session['reviewing_records']) < global_param.LEAST_REVIEWING_SIZE):
            reviewRecords = allReviewingRecords.exclude(
                pk__in=[record['pk'] for record in request.session['reviewing_records']])
            data = RecordSerializer(
                reviewRecords[0:global_param.REVIEW_WINDOW_SIZE], many=True).data
            request.session['reviewing_records'] += data

        request.session.modified = True

        response = {
            'numPending': allReviewingRecords.count(),
            'newRecords': data
        }

        # review plan is finished when num of reviewing records is 0
        if allReviewingRecords.count() == 0:
            # complete milestone
            milestoneSet = Milestone.objects.filter(
                user_id=request.user, plannedAt=date.today())
            if milestoneSet.count() == 0:
                # in case review plan is directly added, not through generateReviewPlan API
                milestone = Milestone.objects.create(
                    user_id=request.user, completed=True)
            elif milestoneSet.count() == 1:
                milestone = milestoneSet[0]
                milestone.completed = True
                milestone.save()
            else:
                Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(response)


@method_decorator(ensure_csrf_cookie, name="dispatch")
class GetCSTRFToken(APIView):
    permission_classes = [permissions.AllowAny, ]

    def get(self, request, format=None):
        """
            use decorator to ensure a CSRF token is included in the cookie even it's a GET request.
        """
        return Response("CSRF Token set")


class CheckAuthenticated(APIView):
    def get(self, request, format=None):
        """
        checks if the current user is authenticated. 
        By default, this API is login only, protected by DRF authentication class. Thus, unauthenticated user will 
        receive 403 before reaching this method. 

        Returns: 200 if the user is authenticated and 403 otherwise
        """
        return Response()


class SearchRecords(APIView):

    def post(self, request, format=None):
        """
        Search records that comply with the search key.
        request: 
        {
            search: string,
            filter: Word | Tag
        }
        return: [Record]
        """
        serializer = SearchRecordSerializer(data=request.data)
        if serializer.is_valid():
            search = serializer.data['search']
            if serializer.data['filter'] == 'Word':
                recordSet = Record.objects.filter(
                    user_id=request.user, word_id__value__icontains=search)

            else:
                # filter by tags
                tagAssignmentSet = TagAssignment.objects.filter(
                    user_id=request.user, tag_id__value__icontains=search)
                # select all quotes with the the above tags, and return the record_id of it.
                quoteSetWithRecordId = Quote.objects.filter(
                    tagAssignment_id__in=tagAssignmentSet).values_list("record_id", flat=True)
                # filter record with recordId
                recordSet = Record.objects.filter(pk__in=quoteSetWithRecordId)
            data = RecordSerializer(recordSet, many=True).data
            return Response(data)
        return Response(status=status.HTTP_400_BAD_REQUEST)


class SearchWords(APIView):
    def post(self, request, format=None):
        """
        search words that comply with the key
        request:
        {
         word: string
        }
        return: [Word]
        """
        serializer = SearchWordTagSerializer(data=request.data)
        if serializer.is_valid():
            search = serializer.data['word']
            wordSet = Record.objects.filter(
                user_id=request.user, word_id__value__icontains=search).values_list("word_id__value", flat=True)
            return Response(wordSet)
        return Response(status=status.HTTP_400_BAD_REQUEST)


class SearchTags(APIView):
    def post(self, request, format=None):
        """
        search tags that comply with the key
        request:
        {
         tag: string
        }
        return: [Tag]
        """
        serializer = SearchWordTagSerializer(data=request.data)
        if serializer.is_valid():
            search = serializer.data['tag']
            tagSet = TagAssignment.objects.filter(
                user_id=request.user, tag_id__value__icontains=search).values_list("tag_id__value", flat=True)
            return Response(tagSet)
        return Response(status=status.HTTP_400_BAD_REQUEST)


class GetMilestoneByMonth(APIView):
    def get(self, request, format=None):
        """
        Get the milestone of a specific month.
        request:
        {
          month: mm
          year: yyyy
        }
        """
        serializer = GetMilestoneSerializer(data=request.query_params)
        if serializer.is_valid():
            print(request.user)
            milestoneSet = Milestone.objects.filter(user_id=request.user, plannedAt__month=serializer.data['month'],
                                                    plannedAt__year=serializer.data['year'])
            data = MilestoneSerializer(milestoneSet, many=True).data
            return Response(data)
        return Response(status=status.HTTP_400_BAD_REQUEST)


""" Legacy Code that constructs response data using for loops and Objects

class DetailEntry():
    def __init__(self, tag, link, value):
        self.tag = tag
        self.link = link
        self.value = value

class ReviewEntry():
    def __init__(self, word, entries):
        self.word = word
        self.entries = entries
    
class GetReview(APIView):
    
    def get(self, request, format=None):
        # get current user
        currentUser = User.objects.get(id=request.user.id)

        records = Record.objects.filter(user_id=currentUser)
        
        reviewEntries = []
        for record in records:
            word = record.word_id
            quotes = Quote.objects.filter(record_id=record)
            
            detailEntries = []
            for quote in quotes:
                tag = quote.tagAssignment_id.tag_id if quote.tagAssignment_id else None
                link = quote.link
                value = quote.value
                detailEntries.append(DetailEntry(tag, link, value))

            reviewEntries.append(ReviewEntry(word, detailEntries))
        s = ReviewSerializer(reviewEntries, many=True)

        return Response(s.data)


class QuoteSerializer(serializers.Serializer):
    tag = serializers.CharField(max_length=30)
    link = serializers.URLField()
    value = serializers.CharField(max_length=300)

class ReviewSerializer(serializers.Serializer):
    word = serializers.CharField(max_length=150)
    entries = QuoteSerializer(many=True)
"""
