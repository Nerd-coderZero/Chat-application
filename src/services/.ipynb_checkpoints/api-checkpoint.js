// src/services/api.js
import config from '../config/environment';

const BASE_URL = config.REACT_APP_API_URL;

export const loginUser = async (username, password) => {
    try {
        console.log('Attempting login to:', `${BASE_URL}/api/token/`);
        const response = await fetch(`${BASE_URL}/api/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
            mode: 'cors'
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Login error details:', errorData);
            throw new Error(errorData.detail || 'Login failed');
        }

        const data = await response.json();
        console.log('Token response:', data);

        const userResponse = await fetch(`${BASE_URL}/api/login/`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${data.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include',
            mode: 'cors'
        });

        if (!userResponse.ok) {
            const errorData = await userResponse.json();
            console.error('User details error:', errorData);
            throw new Error('Failed to get user details');
        }

        const userData = await userResponse.json();
        console.log('User data:', userData);

        return {
            token: data.token,
            user: userData
        };
    } catch (error) {
        console.error('Login process error:', error);
        throw error;
    }
};

export const getUsers = async (token) => {
    try {
        const response = await fetch(`${BASE_URL}/api/users/`, {
            headers: {
                'Authorization': `Token ${token}`,
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Get users error:', errorData);
            throw new Error('Failed to fetch users');
        }
        
        return response.json();
    } catch (error) {
        console.error('Get users error:', error);
        throw error;
    }
};

export const getChatMessages = async (token, userId) => {
    try {
        const response = await fetch(`${BASE_URL}/api/messages/${userId}/`, {
            headers: {
                'Authorization': `Token ${token}`,
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Get messages error:', errorData);
            throw new Error('Failed to fetch messages');
        }
        
        return response.json();
    } catch (error) {
        console.error('Get messages error:', error);
        throw error;
    }
};
// Add a new function to save messages (used by WebSocket service)
export const saveMessage = async (token, senderId, receiverId, message) => {
    const response = await fetch(`${BASE_URL}/api/messages/create/`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sender: senderId,
            receiver: receiverId,
            message: message,
        }),
    });
    if (!response.ok) throw new Error('Failed to save message');
    return response.json();
};