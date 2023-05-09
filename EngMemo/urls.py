from django.contrib import admin
from django.urls import path, include, re_path
from .views import ReactIndex

urlpatterns = [
    path('api/account/', include('account.urls')),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    re_path(r'.*', ReactIndex.as_view(), name="react-index"),
]
