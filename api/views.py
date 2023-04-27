import json

from datetime import date
from math import log
from random import choices, random, randint

from django.contrib.auth.models import User
from django.db.models import Q
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie


from rest_framework.views import APIView
from rest_framework import status, permissions
from rest_framework.response import Response

from .forms import NewRecordForm
from .models import Word, Tag, Record, TagAssignment, Quote
from .serializers import RecordSerializer, QuoteSerializer

from . import global_param
from . import utils

class GetUserContext(APIView):
    def get(self, request, format=None):
        allReviewingRecordsCount = Record.objects.filter(~Q(reviewing_status=3), user_id=request.user, last_planed=date.today()).count()
        response = {
            "numPending": allReviewingRecordsCount
        }
        return Response(response)
        

def NewRecord(request):
    """ API handler that handles user enter new words
    Args:
        request (_type_): The POST request

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
            queryRecord = Record.objects.filter(user_id=currentUser, word_id=word)
            if not queryRecord.exists():
                record = Record(user_id=currentUser, word_id=word)
                record.save()
            else:
                # record is retrieved for Quote
                record = queryRecord[0]

            # save for Tag
            inputTag = form.cleaned_data['tag']
            if inputTag and (not Tag.objects.filter(value=inputTag).exists()):
                tag = Tag(value=inputTag)
                tag.save()

            # save for TagAssignment
            """saving of TagAssignment happens only when:
            1. tag is entered
            2. tag is not yet bound to the user
            """
            if inputTag and (not TagAssignment.objects.filter(user_id=currentUser, tag_id=tag).exists()):
                tagAssignment = TagAssignment(user_id=currentUser, tag_id=tag)
                tagAssignment.save()

            # save for Quote
            # ! tag is empty
            inputQuote, inputLink = form.cleaned_data['quote'], form.cleaned_data['link']
            
            if inputLink or inputQuote:
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
            + 0.2 * (min(1,  date_since_added / global_param.TIME_SINCE_ADDED_DENOMINATOR))
        return prob
    
    def post(self, request, format=None):
        # check if review records are generated
        recordQueryCount = Record.objects.filter(user_id=request.user, last_planed=date.today()).count()
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
            expoSamples = list(map(randomSampleWithWeightFromExpoDistr, recordQuery))
            # select the n minimum samples as candidates
            candidates = sorted(expoSamples, key=lambda x: x[1])[:global_param.NUM_REVIEW_RECORDS_PER_DAY]
            for sample in candidates:
                candidate = sample[0]
                self.initTodaysRecord(candidate)            
        return Response({"success": "Generated"}, status=status.HTTP_201_CREATED)

class GetReview(APIView):
    """
        Fetches all entries that are currently being reviewed, or generate entries to be reviewed.
    """
    def get(self, request, format=None):
        if 'reviewing_records' not in request.session:
            # select from generated reviewing records
            reviewRecords = Record.objects.filter(~Q(reviewing_status=3), user_id=request.user, last_planed=date.today())
            # send only data only within the window size
            data = RecordSerializer(reviewRecords[0:global_param.REVIEW_WINDOW_SIZE], many=True).data
            request.session['reviewing_records'] = data
        else:
            # select from generated reviewing records that are not currently reviewing (inside )
            reviewRecords = Record.objects.filter(~Q(reviewing_status=3), user_id=request.user, last_planed=date.today())\
                .exclude(pk__in=[record['pk'] for record in request.session['reviewing_records']])
            data = RecordSerializer(reviewRecords[0:global_param.REVIEW_WINDOW_SIZE], many=True).data
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
        request.session['reviewing_records'] = list(filter(lambda x: x['pk'] != request.data['pk'], request.session['reviewing_records']))
        record.num_reviewed += 1
        status = request.data['status']
        # < 3 is a safety guard
        if status == global_param.STATUS_KW and record.reviewing_status < 3:
            record.reviewing_status += 1
            if (record.reviewing_status == 3):
                # update mastery when pass with decayed value and increments
                record.mastery = utils.calcDecayedMastery(record) + global_param.MASTERY_INCREMENT * (1 / record.num_reviewed)
                record.last_reviewed = date.today()

        elif status == global_param.STATUS_UC:
            record.reviewing_status = 1
        elif status == global_param.STATUS_DN:
            record.reviewing_status = 0
        record.save()
        
        allReviewingRecords = Record.objects.filter(~Q(reviewing_status=3), user_id=request.user, last_planed=date.today())
        data = None
        # mark more records as reviewing if necessary
        if (len(request.session['reviewing_records']) < global_param.LEAST_REVIEWING_SIZE):    
            reviewRecords = allReviewingRecords.exclude(pk__in=[record['pk'] for record in request.session['reviewing_records']])
            data = RecordSerializer(reviewRecords[0:global_param.REVIEW_WINDOW_SIZE], many=True).data
            request.session['reviewing_records'] += data

        request.session.modified = True

        response = {
            'numPending': allReviewingRecords.count(),
            'newRecords': data
        }
    
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