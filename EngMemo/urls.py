from django.contrib import admin
from django.urls import path, include, re_path
from .views import ReactIndex, AdminLoginView

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/account/', include('account.urls')),
    re_path(r'admin/login/*', AdminLoginView, name="login"),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [re_path(r'.*', ReactIndex.as_view(), name="react-index")]
