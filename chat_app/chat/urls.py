
from django.urls import path
from . import views


urlpatterns = [
    path('<chat_uuid>/messages/', views.MessageListView.as_view()),
    path('<chat_uuid>/', views.ChatView.as_view()),
    path('', views.ChatListCreateView.as_view())
]
