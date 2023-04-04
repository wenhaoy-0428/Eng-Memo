import json
from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.response import Response
from datetime import date
from django.db.models import Q


from .models import Word, Tag, Record, TagAssignment, Quote
from .forms import NewRecordForm
from .serializers import RecordSerializer, QuoteSerializer

from random import random, randint

from .global_param import NUM_REVIEW_RECORDS_PER_DAY,  \
    REVIEW_TIMES_DENOMINATOR, \
    TIME_SINCE_ADDED_DENOMINATOR, \
    REVIEW_WINDOW_SIZE, \
    FAMILIARITY_INCREMENT, \
    STATUS_KW, \
    STATUS_UC, \
    STATUS_DN, \
    LEAST_REVIEWING_SIZE


# todo: is there a way to avoid getting current user in such way?


class GetUserContext(APIView):
    def get(self, request, format=None):
        allReviewingRecordsCount = Record.objects.filter(~Q(todays_status=3), user_id=request.user, todays_hit=True).count()
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
    def get(self, request, format=None):
        if 'reviewing_records' in request.session:
            return Response(request.session['reviewing_records'])
        return Response(status=status.HTTP_204_NO_CONTENT)

class GetReview(APIView):
    """
        Fetches all entries that are currently being reviewed.
    """
    def calcSelectedProb(self, instance):
        date_since_added = (date.today() - instance.date_added).days 
        prob = 0.5 * (1 - instance.familiarity) + 0.3 * (min(1, instance.num_reviewed / REVIEW_TIMES_DENOMINATOR)) \
            + 0.2 * (min(1,  date_since_added / TIME_SINCE_ADDED_DENOMINATOR))
        return prob

    def initTodaysRecord(self, instance):
        instance.todays_hit = True
        # Reset num reviewed
        instance.num_reviewed = 0
        instance.save()

    def get(self, request, format=None):

        # check if review records are generated
        recordQueryCount = Record.objects.filter(user_id=request.user, todays_hit=True).count()
        """
            The if statements are under a condition that as long as a session is available, the data is generated. 
            This is ensured by clearing of session and generated data the same time in a regular basis
        """
        if 'reviewing_records' not in request.session:
            # Generate reviewing records
            if recordQueryCount == 0:
                recordQuery = Record.objects.filter(user_id=request.user).all()
                # All selected records for reviewing 
                reviewRecords = []
                # if review requirement is more than database size
                if recordQuery.count() < NUM_REVIEW_RECORDS_PER_DAY:
                    for record in recordQuery:
                        self.initTodaysRecord(record)
                    reviewRecords = recordQuery
                else:
                    # Keep selecting candidates until meed the USER daily requirement
                    while len(reviewRecords) != NUM_REVIEW_RECORDS_PER_DAY and len(reviewRecords):
                        index = randint(0, recordQuery.count() - 1)
                        dice = random()
                        candidate = recordQuery[index]
                        prob = self.calcSelectedProb(candidate)
                        if (prob > dice):
                            self.initTodaysRecord(candidate)
                            reviewRecords.append(candidate)

            else:
                # select from generated reviewing records
                reviewRecords = Record.objects.filter(~Q(todays_status=3), user_id=request.user, todays_hit=True)
            # send only data only within the window size
            reviewRecords = reviewRecords[0:REVIEW_WINDOW_SIZE]
            data = RecordSerializer(reviewRecords, many=True).data
            request.session['reviewing_records'] = data
        else:
            # select from generated reviewing records
            reviewRecords = Record.objects.filter(~Q(todays_status=3), user_id=request.user, todays_hit=True)\
                .exclude(pk__in=[record['pk'] for record in request.session['reviewing_records']])
            data = RecordSerializer(reviewRecords[0:REVIEW_WINDOW_SIZE], many=True).data
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
        if status == STATUS_KW and record.todays_status < 3:
            record.todays_status += 1
            if (record.todays_status == 3):
                # update familiarity when pass
                record.familiarity += FAMILIARITY_INCREMENT * (1 / record.num_reviewed)
        elif status == STATUS_UC:
            record.todays_status = 1
        elif status == STATUS_DN:
            record.todays_status = 0
        record.save()
        
        allReviewingRecords = Record.objects.filter(~Q(todays_status=3), user_id=request.user, todays_hit=True)
        data = None
        # mark more records as reviewing if necessary
        if (len(request.session['reviewing_records']) < LEAST_REVIEWING_SIZE):    
            reviewRecords = allReviewingRecords.exclude(pk__in=[record['pk'] for record in request.session['reviewing_records']])
            data = RecordSerializer(reviewRecords[0:REVIEW_WINDOW_SIZE], many=True).data
            request.session['reviewing_records'] += data

        request.session.modified = True

        response = {
            'numPending': allReviewingRecords.count(),
            'newRecords': data
        }
    
        return Response(response)


        


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