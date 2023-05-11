from django.views.generic import TemplateView
from django.shortcuts import redirect
from django.urls import reverse
from django.http import HttpResponse


class ReactIndex(TemplateView):
    template_name = "index.html"


def AdminLoginView(request):
    if request.user.is_authenticated:
        return redirect(reverse('index'))
    return HttpResponse(status=404)
