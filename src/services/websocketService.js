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
                // Send authentication message immediately after connection
                this.ws.send(JSON.stringify({
                    type: 'authentication',
                    token: token
                }));
                onConnectionChange(true);
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('Received WebSocket message:', data);
                    
                    // Handle authentication response
                    if (data.type === 'authentication_response') {
                        if (data.status === 'success') {
                            console.log('Authentication successful');
                        } else {
                            console.error('Authentication failed:', data.message);
                            onError(data.message || 'Authentication failed');
                            this.disconnect();
                        }
                        return;
                    }
                    
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
            
            const backoffTime = Math.min(5000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
            this.reconnectTimeout = setTimeout(() => {
                this.connect(roomId, token, onMessage, onConnectionChange, onError);
            }, backoffTime);
        } else {
            onError('Could not reconnect to the chat server. Please refresh the page.');
        }
    }

    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('Sending message:', message);
            this.ws.send(JSON.stringify({
                type: 'chat_message',
                ...message
            }));
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
