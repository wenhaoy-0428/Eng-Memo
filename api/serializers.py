from rest_framework import serializers

from .models import Quote, Record, TagAssignment, Tag


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
        fields = ['word', 'date_added', 'times_reviewed', 'familiarity', 'quotes']