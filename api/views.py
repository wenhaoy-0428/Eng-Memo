import json
from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.response import Response

from .models import Word, Tag, Record, TagAssignment, Quote
from .forms import NewRecordForm
from .serializers import ReviewSerializer

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

