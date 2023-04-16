from django.urls import path, include
from . import views

urlpatterns = [
        path('newRecord/', views.NewRecord, name='new_record'),
        path('getReview/', views.GetReview.as_view(), name='get_review'),
        path('getLibrary/', views.GetLibrary.as_view(), name="get_library"),
        path('updateQuote/', views.UpdateQuote.as_view(), name="update_quote"),
        path('deleteQuotes/', views.DeleteQuotes.as_view(), name="delete_quotes"),
        path('updateReviewingRecordStatus/', views.UpdateReviewingRecordStatus.as_view(), name="update_reviewing_record_status"),
        path('syncReview/', views.SyncReview.as_view(), name="sync_review"),
        path('getUserContext/', views.GetUserContext.as_view(), name="get_user_context"),
        path("auth-get-csrf-token/", views.GetCSTRFToken.as_view(), name="auth_get_csrf_token"),
        path("auth-check/", views.CheckAuthenticated.as_view(), name="check_if_user_authenticated"),
    ]
