from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('self', symmetrical=False, related_name='followers')
    pass

class Post(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_posts")
    message = models.TextField()
    likes = models.ManyToManyField(User, related_name='liked_posts')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message