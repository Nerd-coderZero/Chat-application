// src/config/environment.js
const environment = {
    development: {
        REACT_APP_API_URL: 'http://127.0.0.1:8000',
        REACT_APP_WS_URL: 'ws://127.0.0.1:8000',  // Changed to use Django's port
    },
    production: {
        REACT_APP_API_URL: 'https://kjzero.pythonanywhere.com',
        REACT_APP_WS_URL: 'wss://chat-websocket-service-u4r0.onrender.com',
    }
};

const getEnvironment = () => {
  const env = process.env.NODE_ENV === 'production' ? environment.production : environment.development;
  console.log('Current environment:', process.env.NODE_ENV);
  console.log('Using configuration:', env);
  return env;
};

export default getEnvironment();