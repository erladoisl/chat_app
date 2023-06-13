from django.urls import path

from . import views

urlpatterns = [
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('search/', views.search_user, name='search_user'),
    path('status/', views.status, name='status'),
    path('users/', views.UserListCreateView.as_view())
]
