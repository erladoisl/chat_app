from rest_framework import serializers
from rest_framework.exceptions import APIException, ValidationError
from logging import getLogger

from .models import Message, Chat
from user.serializers import UserSerializer
from user.models import User


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
    recipient = serializers.CharField(max_length=150, write_only=True)

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

    def validate_recipient(self, recipient):
        """
        Checks if recipient is a valid user and not the current user.
        """
        if recipient == self.context['request'].user.username:
            raise ValidationError('Cannot start chat with yourself')

        try:
            return User.objects.get(username=recipient)
        except User.DoesNotExist:
            raise serializers.ValidationError(f'{recipient} does not exist')
        except Exception as e:
            logger.exception('Recipient validation error')
            raise APIException('Could not validated chat recipient', 500)

    def create(self, validated_data):
        user1 = self.context['request'].user
        users = validated_data['recipients']
        name = validated_data['name']

        return Chat.objects.create(name=name, users=users + user1)

    class Meta:
        model = Chat
        fields = ('uuid', 'name', 'users')
