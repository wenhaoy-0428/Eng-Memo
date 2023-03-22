from django.urls import path, include
from . import views

urlpatterns = [
        path('newRecord/', views.NewRecord, name='new_record'),
        
        # path()
    ]
