// Helper pour obtenir l'URL de l'API basée sur l'hôte actuel
export const getApiUrl = () => {
  // En développement, utilise l'hôte actuel (localhost ou IP locale)
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:5000`;
  }
  
  // Fallback pour le serveur ou environnement de test
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
