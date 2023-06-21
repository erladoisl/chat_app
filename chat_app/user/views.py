from rest_framework import status as s
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import login, logout, authenticate
from rest_framework.generics import ListCreateAPIView
from rest_framework.views import APIView

from .serializers import UserSerializer, UsersSerializer, LoginSerializer
from .models import User


class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return Response(status=s.HTTP_400_BAD_REQUEST)

        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = authenticate(request, username=serializer.validated_data['username'],
                                password=serializer.validated_data['password'])

            if user:
                login(request, user)
                return Response(UserSerializer(instance=user).data)

            return Response({'err': 'Invalid credentials'}, status=s.HTTP_403_FORBIDDEN)


class Logout_user(APIView):
    permission_classes = [IsAuthenticated, ]

    def post(self, request, *args, **kwargs):
        logout(request)

        return Response()


class UserStatus(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        user = UserSerializer(instance=request.user)

        return Response(user.data)


class UserListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UsersSerializer

    def get_queryset(self):
        return User.objects.all()
