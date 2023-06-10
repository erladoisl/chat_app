
from django.urls import path
from . import views


urlpatterns = [
    path('<chat_uuid>/', views.MessageListView.as_view()),
    path('', views.ChatListCreateView.as_view())
]
