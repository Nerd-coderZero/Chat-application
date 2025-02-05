# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import ChatMessage

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Authentication check moved to connect method
        if self.scope["user"].is_anonymous: # check if user is anonymous
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to chat server'
        }))

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        except Exception as e:
            print(f"Error in disconnect: {e}") # Print the exception for debugging

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
            return True # Return True on successful save
        except Exception as e:
            print(f"Error saving message: {e}")
            return False  # Return False if save fails

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get('message')  # Use .get() to avoid KeyError
            receiver_id = data.get('receiver_id')  # Use .get()
            sender_id = self.scope["user"].id

            if message and receiver_id: # Check if both message and receiver_id are present
                success = await self.save_message(sender_id, receiver_id, message)

                if success:
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'chat_message',
                            'message': message,
                            'sender': sender_id
                        }
                    )
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': "Message or receiver_id is missing"
                }))

        except json.JSONDecodeError: # Handle JSON decode errors
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': "Invalid JSON data"
            }))
        except Exception as e: # Catch any other exceptions
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']

        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message,
            'sender': sender
        }))
