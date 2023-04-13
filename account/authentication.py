from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

class EmailBackend(ModelBackend):
    """_summary_
    A custom authentication backend that allows user to email to login
    Args:
        ModelBackend: A super class that allows us not to write get_user() function which is necessary to implement
    """
    def authenticate(self, request, email=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            user = UserModel.objects.get(email=email)
        except UserModel.DoesNotExist:
            return None
        else:
            if user.check_password(password):
                return user
        return None