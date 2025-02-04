import React, { useState, useEffect, useRef } from 'react';
import { getUsers, getChatMessages } from '../services/api';
import WebSocketService from '../services/websocketService';

const Layout = ({ token, currentUser, onLogout }) => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const [wsConnected, setWsConnected] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    // Fetch users on component mount
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const fetchedUsers = await getUsers(token);
                setUsers(fetchedUsers);
            } catch (err) {
                setError('Failed to load users');
                console.error('Error loading users:', err);
            }
        };
        loadUsers();
    }, [token]);

    // Handle WebSocket connection when a user is selected
    useEffect(() => {
        if (selectedUser) {
            // Clear existing messages first
            setMessages([]);
            setError(null);
            
            // Load existing messages
            const loadMessages = async () => {
                try {
                    const fetchedMessages = await getChatMessages(token, selectedUser.id);
                    setMessages(fetchedMessages);
                } catch (err) {
                    setError('Failed to load messages');
                    console.error('Error loading messages:', err);
                }
            };
            loadMessages();
    
            // Connect to WebSocket with error handling
            const handleMessage = (data) => {
                if (data.type === 'chat_message') {
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        sender: data.sender,
                        message: data.message,
                        timestamp: new Date().toISOString()
                    }]);
                }
            };
    
            const handleConnectionChange = (connected) => {
                setWsConnected(connected);
                if (!connected) {
                    setError('Lost connection to chat server');
                } else {
                    setError(null);
                }
            };
    
            const handleError = (errorMessage) => {
                setError(errorMessage);
            };
    
            WebSocketService.connect(
                selectedUser.id,
                token,
                handleMessage,
                handleConnectionChange,
                handleError
            );
    
            return () => {
                WebSocketService.disconnect();
            };
        }
    }, [selectedUser, token]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !wsConnected) return;

        const messageData = {
            message: newMessage,
            receiver_id: selectedUser.id
        };

        if (WebSocketService.sendMessage(messageData)) {
            setNewMessage('');
        } else {
            setError('Failed to send message. Please try again.');
        }
    };

    return (
        <div className="h-screen flex flex-col">
            {/* Navbar */}
            <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <div className="flex items-center">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="mr-4 lg:hidden"
                    >
                        ☰
                    </button>
                    <h1 className="text-xl font-bold">Chat App</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <span>{currentUser?.username}</span>
                    <button 
                        onClick={onLogout}
                        className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Users List */}
                <div className={`${isMenuOpen ? 'w-64' : 'w-0'} bg-gray-100 overflow-y-auto transition-all duration-300`}>
                    {users.map(user => (
                        <div
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`p-4 cursor-pointer hover:bg-gray-200 ${
                                selectedUser?.id === user.id ? 'bg-blue-100' : ''
                            }`}
                        >
                            {user.username}
                        </div>
                    ))}
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 bg-gray-50 border-b">
                                <h2 className="text-lg font-semibold">
                                    Chat with {selectedUser.username}
                                </h2>
                                {!wsConnected && (
                                    <span className="text-red-500 text-sm">Disconnected</span>
                                )}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`mb-4 ${
                                            msg.sender === currentUser.id
                                                ? 'text-right'
                                                : 'text-left'
                                        }`}
                                    >
                                        <div
                                            className={`inline-block p-3 rounded-lg ${
                                                msg.sender === currentUser.id
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200'
                                            }`}
                                        >
                                            {msg.message}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t">
                                <div className="flex space-x-4">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 p-2 border rounded"
                                        disabled={!wsConnected}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!wsConnected || !newMessage.trim()}
                                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                                    >
                                        Send
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            Select a user to start chatting
                        </div>
                    )}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
        </div>
    );
};

export default Layout;