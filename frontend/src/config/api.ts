// Configuration pour l'API
// Exporter la configuration actuelle
const isLocal = typeof window !== 'undefined' && 
                (window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' || 
                 window.location.hostname.startsWith('10.0.2.'));

export const config = {
  baseURL: isLocal 
    ? (typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : 'http://localhost:5000')
    : (process.env.NEXT_PUBLIC_API_URL || 'https://fasohealth-backend.onrender.com/api'),
  timeout: 10000
};

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
