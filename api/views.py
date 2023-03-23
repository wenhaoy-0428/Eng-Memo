import json
from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User

from .models import Word, Tag, Record, TagAssignment, Quote
from .forms import NewRecordForm


def NewRecord(request):
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




    
    
