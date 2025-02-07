# Real-time Chat Application Documentation
## Project Overview
This is a full-stack chat application built with Django backend and React frontend, featuring real-time messaging capabilities through WebSocket integration. The application is deployed across multiple platforms with the main application on PythonAnywhere and WebSocket service on Render.

## Technical Stack
### Backend (Django)
- **Django REST Framework** - For API endpoints
- **Channels** - For WebSocket support
- **Authentication** - User registration and login system
- **Database** - Django ORM for data persistence

### Frontend (React)
- **React.js** - UI Framework
- **Tailwind CSS** - Styling
- **WebSocket Client** - Real-time communication
- **Responsive Design** - Multi-device support

### Deployment
- **PythonAnywhere** - Main application hosting
- **Render** - WebSocket service
- **Environment Configuration** - Using .env files

## Key Components Breakdown

### Backend Structure
```
chat_backend/
├── chat_backend/
│   ├── settings.py    # Project settings, DB config, middleware
│   ├── urls.py        # Main URL routing
│   ├── asgi.py        # ASGI config for WebSocket
│   └── wsgi.py        # WSGI config for HTTP
├── chat/
│   ├── models.py      # Data models
│   ├── views.py       # API views
│   ├── consumers.py   # WebSocket consumers
│   ├── routing.py     # WebSocket routing
│   ├── serializers.py # Data serialization
│   └── urls.py        # App-level URL routing
```

### Frontend Structure
```
src/
├── components/
│   ├── Layout.js         # Main layout component
│   ├── ForgotPassword.js # Password recovery
│   └── Login.js          # Authentication UI
├── services/
│   ├── websocketService.js # WebSocket client
│   └── api.js             # API client
├── utils/
│   ├── aws.js            # AWS integrations
│   └── responsive.js      # Responsive design utils
```

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Nerd-coderZero/chat-application.git
   cd chat-application
   ```

2. **Backend Setup**
   ```bash
   cd chat_backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   cd ../
   npm install
   npm start
   ```

4. **WebSocket Service**
   ```bash
   cd websocket_service
   pip install -r requirements.txt
   python websocket_service.py
   ```

## Deployment Configuration

### PythonAnywhere Setup
1. Create a PythonAnywhere account
2. Configure WSGI file
3. Set up static files
4. Configure environment variables
5. Deploy Django application

### Render WebSocket Service
1. Create a Render account
2. Configure WebSocket service
3. Set environment variables
4. Deploy WebSocket server

## Key Features
- User authentication and authorization
- Real-time messaging
- User presence detection
- Message history
- Responsive design
- Secure WebSocket communication

## Security Considerations
- CORS configuration
- Authentication tokens
- WebSocket security
- Environment variable protection
- XSS prevention
- CSRF protection

## Testing
- Unit tests for backend APIs
- WebSocket connection testing
- Frontend component testing
- Integration testing
- Load testing for WebSocket connections

## Maintenance and Monitoring
- Error logging
- Performance monitoring
- Database backups
- Security updates
- WebSocket connection health checks
