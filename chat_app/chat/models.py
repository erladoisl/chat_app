from django.db import models
from django.contrib.auth.models import User
# Create your models here.


class Chat(models.Model):
    name = models.CharField(max_length=250)
    users = models.ManyToManyField(User)

    def __str__(self):
        return self.name
    


class Message(models.Model):
    text = models.CharField(max_length=250)
    read = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    
    date = models.TimeField(auto_now_add=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ('timestamp',)