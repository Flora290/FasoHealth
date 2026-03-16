// Configuration pour l'API
export const API_CONFIG = {
  // Pour le développement local
  development: {
    // Essaye d'abord l'IP locale, sinon fallback sur localhost
    baseURL: process.env.NODE_ENV === 'development' 
      ? `http://${window.location.hostname}:5000`
      : 'http://localhost:5000',
    timeout: 10000
  },
  
  // Pour la production
  production: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://fasohealth-backend.onrender.com/api',
    timeout: 10000
  }
};

// Types pour la configuration
type Environment = 'development' | 'production';

// Exporter la configuration actuelle
export const config = API_CONFIG[process.env.NODE_ENV as Environment] || API_CONFIG.development;

// Helper pour les appels API
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${config.baseURL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include' as RequestCredentials,
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    return response;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};
