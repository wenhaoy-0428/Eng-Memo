import json
from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.response import Response

from .models import Word, Tag, Record, TagAssignment, Quote
from .forms import NewRecordForm
from .serializers import RecordSerializer, QuoteSerializer

# todo: is there a way to avoid getting current user in such way?

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

class GetReview(APIView):
    """
        Fetches all entries that are currently being reviewed.
    """
    def get(self, request, format=None):
        # get current user
        currentUser = User.objects.get(id=request.user.id)

        records = Record.objects.filter(user_id=currentUser)
        
        reviewEntries = RecordSerializer(records, many=True).data

        return Response(reviewEntries)


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