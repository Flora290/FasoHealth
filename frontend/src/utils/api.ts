// Helper pour obtenir l'URL de l'API basée sur l'hôte actuel
export const getApiUrl = () => {
  // En production, utilise l'URL Render
  if (process.env.NODE_ENV === 'production' || (typeof window !== 'undefined' && window.location.hostname !== 'localhost')) {
    return 'https://fasohealth-backend.onrender.com';
  }
  
  // En développement local
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:5000`;
  }
  
  return 'http://localhost:5000';
};

// Helper pour les appels API avec gestion d'erreur
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${getApiUrl()}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};
