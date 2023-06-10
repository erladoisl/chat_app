from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter
from channels.routing import URLRouter

from django.core.asgi import get_asgi_application

from chat_app.consumers import ChatConsumer

import os
from django.urls import re_path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chat_app.settings')


django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter([
            re_path(r'^ws/chat/(?P<chat_id>[0-9a-f-]+)/$', ChatConsumer.as_asgi())
        ])
    )
})
