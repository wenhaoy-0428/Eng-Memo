from rest_framework import serializers

from .models import Quote, Record, TagAssignment, Tag

from . import utils


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['value']


class TagAssignmentToTagField(serializers.RelatedField):
    """ A custom relational filed that is used by @link QuoteSerializer
    """

    def to_representation(self, value):
        return f'{value.tag_id}'


class QuoteSerializer(serializers.ModelSerializer):
    tag = TagAssignmentToTagField(source='tagAssignment_id', read_only=True)

    class Meta:
        model = Quote
        fields = ['pk', 'link', 'value', 'tag']


class RecordSerializer(serializers.ModelSerializer):
    word = serializers.StringRelatedField(source='word_id')
    quotes = QuoteSerializer(many=True, read_only=True)

    class Meta:
        model = Record
        fields = ['pk', 'word', 'date_added', 'mastery', 'quotes']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # update the representation of mastery so that it shows decayed value since last reviewed.
        ret['mastery'] = utils.calcDecayedMastery(instance)
        return ret


class SearchRecordSerializer(serializers.Serializer):
    search = serializers.CharField()
    CHOICES = [('Word', 'Word'), ('Tag', 'Tag')]
    filter = serializers.ChoiceField(choices=CHOICES)
