from django.contrib import admin
from django.urls import path
from rest_framework.authtoken import views as token_views
from chat import views
from django.http import HttpResponse

def home(request):
    return HttpResponse("<h1>Welcome to the Chat Application</h1>")


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', token_views.obtain_auth_token),  # Changed this
    path('api/users/', views.get_users),
    path('api/messages/<int:user_id>/', views.get_chat_messages),
    path('api/login/', views.login_user),
    path('', home),  # Root URL
]