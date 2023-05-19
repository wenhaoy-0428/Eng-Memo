from django.db import models
from django.contrib.auth.models import User
# Create your models here.
from .validators import MaxAvatarSizeValidator


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # https://docs.djangoproject.com/en/4.2/ref/models/fields/#filefield
    avatar = models.ImageField(upload_to="avatars/", validators=[MaxAvatarSizeValidator])

    def __str__(self):
        return self.user.username
