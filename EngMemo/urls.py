from django.contrib import admin
from django.urls import path, include, re_path
from .views import ReactIndex, AdminLoginView

urlpatterns = [
    path('api/account/', include('account.urls')),
    re_path(r'admin/login/*', AdminLoginView, name="login"),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    re_path(r'.*', ReactIndex.as_view(), name="react-index"),
]
