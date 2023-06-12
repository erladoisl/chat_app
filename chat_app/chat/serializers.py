from rest_framework import serializers
from rest_framework.exceptions import APIException
from logging import getLogger

from .models import Message, Chat
from user.serializers import UserSerializer


logger = getLogger('chat_serializers')


class MessageSerializer(serializers.ModelSerializer):
    recieved = serializers.SerializerMethodField('is_reciever')

    def is_reciever(self, obj):
        """
        Returns true if this chat message was recieved by the user getting the 
        messages.
        """
        try:
            user = self.context['request'].user
            return user != obj.sender
        except KeyError:
            logger.exception('Request not passed to context')
            raise APIException()

    class Meta:
        model = Message
        fields = ('uuid', 'created_at', 'text', 'read', 'recieved')


class ChatSerializer(serializers.ModelSerializer):
    users = serializers.SerializerMethodField('get_other_users')

    def get_other_users(self, obj):
        """
        Returns the other users model.
        """
        try:
            users = []
            for user in obj.users.all():
                users.append(UserSerializer(user).data)

            return users
        except KeyError:
            logger.exception('Request not passed to context')
            raise APIException()

    def create(self, validated_data):
        user = self.context['request'].user
        name = validated_data['name']

        chat = Chat.objects.create(name=name)
        chat.save()
        chat.users.set([user])
        chat.save()
        
        return chat

    class Meta:
        model = Chat
        fields = ('uuid', 'name', 'users')
