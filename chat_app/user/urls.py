from django.urls import path

from . import views

urlpatterns = [
    path('login/', views.CustomAuthToken.as_view(), name='login'),
    path('logout/', views.Logout_user.as_view(), name='logout'),
    path('status/', views.UserStatus.as_view(), name='status'),
    path('users/', views.UserListCreateView.as_view())
]
