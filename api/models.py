from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime, date


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
    mastery = models.FloatField(default=0)

    """
    default = date_added makes newly added records to be included in the target,
    and target generation is skipped, so that set default to epoch
    """
    # last time this record was planed be to reviewed
    last_planed = models.DateField(default=timezone.now)
    # last time this record was reviewed (finished).
    last_reviewed = models.DateField(default=datetime.fromtimestamp(0))
    """
    All fields below are valid only when last_planed is the same as today, 
    meaning the record is included in the reviewing target of the day
    """
    # current status when reviewing.
    STATUS_CHOICES = [(0, "Don't Know"), (1, "Uncertain"),
                      (2, "Uncertain or Default"), (3, "Pass")]
    reviewing_status = models.PositiveSmallIntegerField(
        default=2, choices=STATUS_CHOICES)
    # number of times has reviewed for today.
    num_reviewed = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f'{self.user_id}-{self.word_id}'


class TagAssignment(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    tag_id = models.ForeignKey(Tag, on_delete=models.CASCADE)


class Quote(models.Model):
    tagAssignment_id = models.ForeignKey(
        TagAssignment, on_delete=models.CASCADE, null=True)
    record_id = models.ForeignKey(
        Record, related_name='quotes', on_delete=models.CASCADE)
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


class Milestone(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
    plannedAt = models.DateField(
        null=False, blank=False, default=date.today)
    completed = models.BooleanField(default=False, null=False)

    class Meta:
        unique_together = ('user_id', 'plannedAt')

    def __str__(self):
        return f'{self.user_id}-{self.plannedAt}'
