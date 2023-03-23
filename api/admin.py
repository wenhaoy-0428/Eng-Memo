from django.contrib import admin
from .models import Record, Word, Tag, TagAssignment, Quote
# Register your models here.
admin.site.register(Record)
admin.site.register(Word)
admin.site.register(Tag)
admin.site.register(TagAssignment)
admin.site.register(Quote)