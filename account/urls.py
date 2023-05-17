from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.Register.as_view(), name='account_register'),
    path('login/', views.Login.as_view(), name="login_view"),
    path('logout/', views.Logout.as_view(), name="logout_view"),
    path('activate/<uidb64>/<token>',
         views.ActivateAccount.as_view(), name="activate_account"),
    path('upload-avatar/', views.UploadAvatar.as_view(), name="upload_avatar"),
    # APIs FOR TEST ONLY
    # path('send-account-activation-email', views.TestViewSendActivationEmail.as_view(), name="send_account_activation_email"),
]
