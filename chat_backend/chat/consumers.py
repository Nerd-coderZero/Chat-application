# chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import ChatMessage

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        self.user = self.scope["user"]

        # Reject the connection if user is not authenticated
        if self.user.is_anonymous:
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to chat server'
        }))

    async def disconnect(self, close_code):
        # Leave room group
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        except:
            pass

    @database_sync_to_async
    def save_message(self, sender, receiver, message):
        try:
            sender_user = User.objects.get(id=sender)
            receiver_user = User.objects.get(id=receiver)
            ChatMessage.objects.create(
                sender=sender_user,
                receiver=receiver_user,
                message=message
            )
        except Exception as e:
            print(f"Error saving message: {e}")
            return False
        return True

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data['message']
            receiver_id = data['receiver_id']
            sender_id = self.scope["user"].id

            # Save message to database
            success = await self.save_message(sender_id, receiver_id, message)
            
            if success:
                # Send message to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'sender': sender_id
                    }
                )
        except Exception as e:
            # Send error message back to client
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message,
            'sender': sender
        }))