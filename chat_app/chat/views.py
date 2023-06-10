from rest_framework.generics import ListAPIView, ListCreateAPIView, DestroyAPIView
from rest_framework.permissions import IsAuthenticated

from .permissions import HasChatPermissions
from .serializers import MessageSerializer, ChatSerializer

from .models import Message, Chat


class MessageListView(ListAPIView):
    permission_classes = [HasChatPermissions]
    serializer_class = MessageSerializer

    def get_queryset(self):
        return Message.objects.filter(chat__uuid=self.kwargs['chat_uuid']).order_by('-created_at')


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
