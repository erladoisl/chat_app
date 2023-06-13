from rest_framework.generics import ListAPIView, ListCreateAPIView, DestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .permissions import HasChatPermissions
from .serializers import MessageSerializer, ChatSerializer

from .models import Message, Chat


class MessageListView(ListAPIView):
    permission_classes = [HasChatPermissions]
    serializer_class = MessageSerializer

    def get_queryset(self):
        messages = Message.objects.filter(chat__uuid=self.kwargs['chat_uuid']).order_by('-created_at')
        cur_user_uuid = self.request.user.uuid
        
        for message in messages:
            if not message.read and message.sender.uuid != cur_user_uuid:
                message.read = True
                message.save()
        
        return messages

class ChatView(APIView):
    permission_classes = [IsAuthenticated]
     
    def get(self, request, chat_uuid):
        try:
            chat = Chat.objects.get(uuid=chat_uuid)
            context = {
                'type': 'chat',
                'uuid': chat.uuid,
                'name': chat.name,
                'users': [user.uuid for user in chat.users.all()]
            }
        except Chat.DoesNotExist:
            context = {
                'type': 'error',
                    'data': {
                        'message': f'Chat {chat_uuid} does not exist'
                    }
            }
        finally:
            return Response(data=context)
    
       

class ChatListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatSerializer

    def get_queryset(self):
        return Chat.objects.filter(users__in=[self.request.user])


class ChatDestroyView(DestroyAPIView):
    permission_classes = [HasChatPermissions]
    serializer_class = ChatSerializer
    lookup_field = 'uuid'
    lookup_url_kwarg = 'chat_uuid'

    def get_queryset(self):
        return Chat.objects.filter(users__in=[self.request.user])
