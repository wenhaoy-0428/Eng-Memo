from django import forms

class NewRecordForm(forms.Form):
    word = forms.CharField(max_length=150, required=True)
    tag = forms.CharField(max_length=30, required=False)
    quote = forms.CharField(max_length=300, required=False)
    link = forms.URLField(required=False)
