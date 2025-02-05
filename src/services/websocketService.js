import config from '../config/environment';

class WebSocketService {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectTimeout = null;
    }

    connect(roomId, token, onMessage, onConnectionChange, onError) {
        this.disconnect();
        try {
            const wsUrl = `${config.REACT_APP_WS_URL}/ws/chat/${roomId}/?token=${token}`;
            console.log('Connecting to WebSocket:', wsUrl);
            
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                onConnectionChange(true);
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('Received WebSocket message:', data);
                    
                    if (data.type === 'chat_message') {
                        onMessage(data);
                    } else if (data.type === 'connection_established') {
                        console.log('Connection established with server');
                    } else {
                        console.log('Received unknown message type:', data.type);
                    }
                } catch (error) {
                    console.error('Failed to process message:', error);
                }
            };

            this.ws.onclose = (event) => {
                console.log('WebSocket closed:', event);
                onConnectionChange(false);
                if (!event.wasClean) {
                    this.handleReconnection(roomId, token, onMessage, onConnectionChange, onError);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                onError('Connection error occurred. Please try again.');
            };
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            onError('Failed to create connection. Please try again.');
        }
    }

    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('Sending message:', message);
            // Ensure message has the correct structure
            const messageData = {
                type: 'chat_message',
                message: message.message,
                receiver_id: message.receiver_id
            };
            this.ws.send(JSON.stringify(messageData));
            return true;
        }
        return false;
    }

    handleReconnection(roomId, token, onMessage, onConnectionChange, onError) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            onError(`Connection lost. Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            this.reconnectTimeout = setTimeout(() => {
                this.connect(roomId, token, onMessage, onConnectionChange, onError);
            }, 5000 * Math.min(this.reconnectAttempts, 3));
        } else {
            onError('Could not reconnect to the chat server. Please refresh the page.');
        }
    }

    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        if (this.ws) {
            this.ws.close(1000, 'User disconnected');
            this.ws = null;
        }
    }
}

export default new WebSocketService();
