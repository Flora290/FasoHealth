'use client';

import { useState, useEffect } from 'react';

interface SlowConnectionModeProps {
  children: React.ReactNode;
}

export default function SlowConnectionMode({ children }: SlowConnectionModeProps) {
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [dataSaverMode, setDataSaverMode] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Détecter la vitesse de connexion
    const checkConnectionSpeed = () => {
      const connection = (navigator as any).connection || 
                         (navigator as any).mozConnection || 
                         (navigator as any).webkitConnection;

      if (connection) {
        // Si la connexion est lente (2G ou moins)
        if (connection.effectiveType === '2g' || 
            connection.effectiveType === 'slow-2g' ||
            connection.downlink < 0.5) { // moins de 0.5 Mbps
          setIsSlowConnection(true);
          setShowBanner(true);
        }

        // Activer le mode économie de données si demandé
        if (connection.saveData) {
          setDataSaverMode(true);
        }
      }

      // Détecter si l'utilisateur est sur mobile et connexion potentiellement lente
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        // Test de vitesse simple
        const startTime = Date.now();
        fetch('https://httpbin.org/json', { method: 'HEAD' })
          .then(() => {
            const loadTime = Date.now() - startTime;
            if (loadTime > 3000) { // plus de 3 secondes
              setIsSlowConnection(true);
              setShowBanner(true);
            }
          })
          .catch(() => {
            setIsSlowConnection(true);
            setShowBanner(true);
          });
      }
    };

    // Vérifier la connexion au chargement
    checkConnectionSpeed();

    // Écouter les changements de connexion
    const handleConnectionChange = () => {
      checkConnectionSpeed();
    };

    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);

    return () => {
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
    };
  }, []);

  // Optimiser les ressources si connexion lente
  useEffect(() => {
    if (isSlowConnection || dataSaverMode) {
      // Désactiver les animations
      document.body.classList.add('slow-connection');
      
      // Réduire la qualité des images
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (img.src && !img.src.includes('low-quality')) {
          img.loading = 'lazy';
        }
      });

      // Désactiver les vidéos autoplay
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        video.autoplay = false;
        video.preload = 'none';
      });

      // Optimiser les polices (charger le minimum)
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    } else {
      document.body.classList.remove('slow-connection');
    }
  }, [isSlowConnection, dataSaverMode]);

  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('slow-connection-banner-dismissed', 'true');
  };

  useEffect(() => {
    const dismissed = localStorage.getItem('slow-connection-banner-dismissed');
    if (dismissed) {
      setShowBanner(false);
    }
  }, []);

  const toggleDataSaver = () => {
    setDataSaverMode(!dataSaverMode);
    localStorage.setItem('data-saver-mode', (!dataSaverMode).toString());
  };

  return (
    <>
      {/* Banner pour connexion lente */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-50 border-b border-yellow-200 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="text-yellow-600">🐢</span>
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Connexion lente détectée
                  </p>
                  <p className="text-xs text-yellow-600">
                    Optimisation automatique activée pour une meilleure expérience
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleDataSaver}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium hover:bg-yellow-200 transition-colors"
                >
                  {dataSaverMode ? '💾 Économie ON' : '💾 Économie OFF'}
                </button>
                <button
                  onClick={handleDismissBanner}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode optimisé pour connexion lente */}
      {(isSlowConnection || dataSaverMode) && (
        <style jsx>{`
          .slow-connection * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          
          .slow-connection .floating-pills {
            display: none !important;
          }
          
          .slow-connection .bg-gradient-to-r {
            background-image: none !important;
            background-color: inherit !important;
          }
          
          .slow-connection img {
            filter: blur(0px) !important;
            transform: none !important;
          }
          
          .slow-connection video {
            display: none !important;
          }
          
          .slow-connection .animate-spin {
            animation: none !important;
          }
          
          @media (prefers-reduced-data: reduce) {
            .slow-connection * {
              background-image: none !important;
              box-shadow: none !important;
              text-shadow: none !important;
            }
          }
        `}</style>
      )}

      {/* Indicateur de mode économie */}
      {(isSlowConnection || dataSaverMode) && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-full text-xs font-medium z-40">
          🐢 Mode optimisé
        </div>
      )}

      {/* Contenu avec optimisations */}
      <div className={`slow-connection-wrapper ${isSlowConnection || dataSaverMode ? 'optimized' : ''}`}>
        {children}
      </div>

      {/* Script pour les optimisations supplémentaires */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Service Worker pour mode hors ligne
          if ('serviceWorker' in navigator && (navigator.connection?.effectiveType === '2g' || navigator.connection?.effectiveType === 'slow-2g')) {
            navigator.serviceWorker.register('/sw-slow.js').catch(() => {
              console.log('Service Worker registration failed');
            });
          }

          // Optimiser le chargement des images
          if ('loading' in HTMLImageElement.prototype) {
            const images = document.querySelectorAll('img');
            images.forEach(img => {
              img.loading = 'lazy';
            });
          }

          // Désactiver les polices web si connexion très lente
          if (navigator.connection?.downlink < 0.1) {
            document.documentElement.style.setProperty('--font-display', 'swap');
          }
        `
      }} />
    </>
  );
}
