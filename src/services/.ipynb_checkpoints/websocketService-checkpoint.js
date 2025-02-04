// src/services/websocketService.js
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
            // Use the Django Channels WebSocket URL format
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
                    onMessage(data);
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

    handleReconnection(roomId, token, onMessage, onConnectionChange, onError) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            onError(`Connection lost. Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            this.reconnectTimeout = setTimeout(() => {
                this.connect(roomId, token, onMessage, onConnectionChange, onError);
            }, 5000 * Math.min(this.reconnectAttempts, 3)); // Exponential backoff up to 15 seconds
        } else {
            onError('Could not reconnect to the chat server. Please refresh the page.');
        }
    }

    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('Sending message:', message);
            this.ws.send(JSON.stringify(message));
            return true;
        }
        return false;
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