from rest_framework import permissions
from logging import getLogger

from .models import Chat


logger = getLogger('chat_permissions')


class HasChatPermissions(permissions.BasePermission):
    message = 'Chat does not exist'
    code = 404

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        try:
            # try and get the chat uuid with the current user
            chat_uuid = view.kwargs.get('chat_uuid')
            chat = Chat.objects.get(uuid=chat_uuid)

            return request.user in chat.users.all()
        except Chat.DoesNotExist:
            logger.warning(
                f'Chat access permission denied for user {request.user}')
            return False
        except Exception:
            logger.exception('Error checking chat permission')
