from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Word(models.Model):
    value = models.CharField(max_length=150, unique=True)

    def __str__(self):
        return self.value
    
class Tag(models.Model):
    value = models.CharField(max_length=30, unique=True)
    def __str__(self):
        return self.value

class Record(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    word_id = models.ForeignKey(Word, on_delete=models.CASCADE)
    date_added = models.DateField(default=timezone.now)
    familiarity = models.FloatField(default=0)
    # ------
    todays_hit = models.BooleanField(default=False)
    # current status when reviewing. This field is only used when today_hit is True
    STATUS_CHOICES = [(0, "Don't Know"), (1, "Uncertain"), (2, "Uncertain or Default"), (3, "Pass")]
    todays_status = models.PositiveSmallIntegerField(default=2, choices=STATUS_CHOICES)

    # represent the number of times reviewed before hit a pass when today_hit is False
    # represent the number of times currently reviewed if today_hit is True
    num_reviewed = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f'{self.user_id}-{self.word_id}'

class TagAssignment(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    tag_id = models.ForeignKey(Tag, on_delete=models.CASCADE)

class Quote(models.Model):
    tagAssignment_id = models.ForeignKey(TagAssignment, on_delete=models.CASCADE, null=True)
    record_id = models.ForeignKey(Record, related_name='quotes', on_delete=models.CASCADE)
    value = models.CharField(max_length=300, null=True)
    # we assume quote and link have 1 to 1 relationship
    link = models.URLField(null=True)

    def __str__(self):
        # gets the value returned from each models __str__ method
        try:
            tag = self.tagAssignment_id.tag_id
        except:
            tag = "null"
        
        return f'{self.record_id.user_id}-{self.record_id.word_id}-{tag}-{self.value[0:30]}'

