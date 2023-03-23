from rest_framework import serializers

from .models import Quote




class QuoteSerializer(serializers.Serializer):
    tag = serializers.CharField(max_length=30)
    link = serializers.URLField()
    value = serializers.CharField(max_length=300)


class ReviewSerializer(serializers.Serializer):
    word = serializers.CharField(max_length=150)
    entries = QuoteSerializer(many=True)
    