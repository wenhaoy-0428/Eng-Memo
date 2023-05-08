from django.contrib import admin
from django.urls import path, include
from .views import ReactIndex

urlpatterns = [
    path('', ReactIndex.as_view(), name="react-index"),
    path('api/account/', include('account.urls')),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls'))
]
