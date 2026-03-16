// Helper pour obtenir l'URL de l'API basée sur l'hôte actuel
export const getApiUrl = () => {
  // En développement local (localhost ou IP locale d'émulateur)
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' || 
       window.location.hostname.startsWith('10.0.2.'))) {
    return `http://${window.location.hostname}:5000`;
  }
  
  // Par défaut, utilise l'URL de production Render
  return 'https://fasohealth-backend.onrender.com';
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
