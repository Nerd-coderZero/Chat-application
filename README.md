# Chat Backend Project - Django with Channels

This project is a real-time chat application built with Django, Django Channels, and the Django REST Framework (DRF). The backend handles WebSocket connections, RESTful APIs, and authentication, allowing users to send and receive messages in real-time.

## Features:
- Real-time messaging via WebSockets (in development, fallback to REST API)
- Token-based authentication for secure communication
- REST API endpoints for sending and receiving messages
- Frontend React app (not included here, but can be integrated easily)

## Technologies Used:
- **Django** (Backend Framework)
- **Django Channels** (Real-time WebSockets)
- **Django REST Framework** (API)
- **Gunicorn** (Web Server)(test phase)
- **SQLite** (Database for development)

### Steps to Run Locally:
1. Clone the repository:
   ```bash
   git clone https://github.com/Nerd-coderZero/chat-application.git
   cd chat-backend

2. Create a virtual environment (optional but recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows, use venv\Scripts\activate

3. Install dependencies:
   ```bash
   pip install -r requirements.txt

4. Run migrations:
   ```bash
   python manage.py migrate

5. Create a superuser (for admin access):
   ```bash
   python manage.py createsuperuser

6. Run the Django development server:
   ```bash
   python manage.py runserver

Your app will now be running on http://127.0.0.1:8000.


## Frontend (React)

### Prerequisites
Make sure you have the following installed:

-Node.js
-npm (Node Package Manager)

### Setup Instructions
Clone the repository (if you haven’t already):(follow above backend step)
```bash
git clone https://github.com/Nerd-coderZero/chat-application.git
```
Navigate to the frontend directory:

```bash
cd chat-application              [(if not already in)]
```
Install dependencies:

```bash
npm install
```
Start the frontend server:

```bash
npm start
```
The React frontend will be available at http://localhost:3000/.

## PS: Optional
```bash
python manage.py collectstatic 
```
Run this once again in backend folder directory

Project Structure
backend/ - Contains the Django backend code and settings.
frontend/ - Contains the React frontend code.

## Notes

### WebSocket Limitation: The backend was developed to support WebSocket functionality; however, due to free-tier hosting limitations, WebSocket functionality is disabled. I tried to use alternative approaches but due to lack of knowledge wasted lots of time.

Running Both Servers: To fully run the application, both the backend and the frontend need to be running on separate terminals:

Terminal 1: Run the Django backend (python manage.py runserver).
Terminal 2: Run the React frontend (npm start).
Contribution
Feel free to fork this repository and submit pull requests for improvements or bug fixes.
