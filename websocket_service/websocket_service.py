# websocket_service.py
import asyncio
import json
import websockets
import os
import aiohttp
import logging
from dotenv import load_dotenv

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

class ChatWebSocket:
    def __init__(self):
        self.connections = {}
        self.django_api_url = os.getenv('DJANGO_API_URL', 'http://localhost:8000')
        logger.info(f"Initialized ChatWebSocket with Django API URL: {self.django_api_url}")

    async def verify_token(self, token):
        try:
            headers = {'Authorization': f'Token {token}'}
            async with aiohttp.ClientSession() as session:
                async with session.post(f'{self.django_api_url}/api/login/', headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        logger.info(f"Token verified successfully for user: {data.get('username', 'Unknown')}")
                        return data
                    logger.error(f"Token verification failed. Status: {response.status}")
                    return None
        except Exception as e:
            logger.error(f"Error verifying token: {str(e)}")
            return None

async def handler(self, websocket, path):
    room_name = None
    try:
        # Extract room_name and token from path
        room_name = path.split('/')[-2]
        query_params = parse_qs(websocket.path_params['query_string'].decode())
        token = query_params.get('token', [None])[0]
        
        logger.info(f"New connection attempt for room: {room_name}")
        
        if not token:
            logger.error("No token in URL parameters")
            await websocket.close(1008, 'No token in URL parameters')
            return

        # Verify token immediately
        user_data = await self.verify_token(token)
        if not user_data:
            logger.error("Invalid token in URL parameters")
            await websocket.close(1008, 'Invalid token')
            return

        # Register connection
        if room_name not in self.connections:
            self.connections[room_name] = set()
        self.connections[room_name].add(websocket)
        logger.info(f"Connection registered for room {room_name}")

        # Send connection confirmation
        await websocket.send(json.dumps({
            'type': 'connection_established',
            'message': 'Connected to chat server',
            'user': user_data
        }))

        # Message handling loop
        async for message in websocket:
            try:
                data = json.loads(message)
                logger.info(f"Received message in room {room_name}")
                
                if data.get('type') == 'chat_message':
                    await self.broadcast_message(room_name, {
                        'type': 'chat_message',
                        'message': data['message'],
                        'sender': user_data['id']
                    })
            except json.JSONDecodeError:
                logger.error("Invalid message format received")
                continue

    except websockets.exceptions.ConnectionClosed:
        logger.info(f"Connection closed for room: {room_name}")
    except Exception as e:
        logger.error(f"Error in handler: {str(e)}")
    finally:
        if room_name and room_name in self.connections:
            self.connections[room_name].discard(websocket)
            if not self.connections[room_name]:
                del self.connections[room_name]

    async def broadcast_message(self, room_name, message):
        if room_name in self.connections:
            disconnected = set()
            for conn in self.connections[room_name]:
                try:
                    await conn.send(json.dumps(message))
                except websockets.exceptions.ConnectionClosed:
                    disconnected.add(conn)
                except Exception as e:
                    logger.error(f"Error broadcasting message: {str(e)}")
                    disconnected.add(conn)
            
            # Remove disconnected clients
            for conn in disconnected:
                self.connections[room_name].discard(conn)
            if not self.connections[room_name]:
                del self.connections[room_name]

async def main():
    chat = ChatWebSocket()
    port = int(os.getenv('PORT', 8001))
    host = "0.0.0.0"
    
    logger.info(f"Starting WebSocket server on {host}:{port}")
    
    async with websockets.serve(
        chat.handler,
        host,
        port,
        ping_interval=20,
        ping_timeout=20
    ):
        logger.info("WebSocket server is running")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
