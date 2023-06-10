from django.db import models
from uuid import uuid4


class Chat(models.Model):
    uuid = models.UUIDField(default=uuid4, null=False)
    name = models.CharField(max_length=250)
    users = models.ManyToManyField('user.User')

    def __str__(self):
        return self.name


class Message(models.Model):
    uuid = models.UUIDField(default=uuid4, null=False)
    text = models.CharField(max_length=250)
    read = models.BooleanField(default=False)
    sender = models.ForeignKey('user.User', on_delete=models.CASCADE)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, null=False)

    def __str__(self):
        return f'message: {self.text} sender: {self.sender.username}'

    class Meta:
        ordering = ('created_at',)
