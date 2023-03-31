from django.urls import path, include
from . import views

urlpatterns = [
        path('newRecord/', views.NewRecord, name='new_record'),
        path('getReview/', views.GetReview.as_view(), name='get_review'),
        path('getLibrary/', views.GetLibrary.as_view(), name="get_library"),
        path('updateQuote/', views.UpdateQuote.as_view(), name="update_quote"),
        path('deleteQuotes/', views.DeleteQuotes.as_view(), name="delete_quotes"),
        path('updateReviewingRecordStatus', views.UpdateReviewingRecordStatus.as_view(), name="update_reviewing_record_status")
    ]
