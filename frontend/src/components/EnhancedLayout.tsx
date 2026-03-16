'use client';

import { ReactNode, useEffect, useState } from 'react';
import FloatingPillsBackground from './FloatingPillsBackground';
import LanguageSelector from './LanguageSelector';
import SlowConnectionMode from './SlowConnectionMode';
import { getPreferredLanguage, Language } from '../utils/translations';

interface LayoutProps {
  children: ReactNode;
  showFloatingPills?: boolean;
  showLanguageSelector?: boolean;
  showSlowConnectionMode?: boolean;
}

export default function EnhancedLayout({ 
  children, 
  showFloatingPills = true,
  showLanguageSelector = true,
  showSlowConnectionMode = true
}: LayoutProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const preferred = getPreferredLanguage();
    setCurrentLanguage(preferred);
  }, []);

  // Optimisations pour les appareils bas de gamme
  useEffect(() => {
    if (!mounted) return;

    // Détecter les capacités du navigateur
    const isLowEndDevice = () => {
      const memory = (navigator as any).deviceMemory;
      const cores = navigator.hardwareConcurrency;
      const connection = (navigator as any).connection;
      
      return (
        (memory && memory < 2) || // moins de 2GB RAM
        (cores && cores < 4) || // moins de 4 coeurs
        (connection && connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g')
      );
    };

    if (isLowEndDevice()) {
      document.body.classList.add('low-end-device');
      
      // Réduire les animations
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
      
      // Optimiser les performances
      const style = document.createElement('style');
      style.textContent = `
        .low-end-device * {
          animation-duration: 0.1s !important;
          transition-duration: 0.1s !important;
        }
        .low-end-device .floating-pills {
          opacity: 0.3 !important;
        }
        .low-end-device .bg-gradient-to-r {
          background-image: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Détecter si l'écran est petit
    const isSmallScreen = window.innerWidth < 768;
    if (isSmallScreen) {
      document.body.classList.add('small-screen');
    }

    // Optimiser pour les navigateurs anciens
    const isOldBrowser = !('IntersectionObserver' in window) || 
                          !('fetch' in window) || 
                          !('Promise' in window);
    
    if (isOldBrowser) {
      document.body.classList.add('old-browser');
    }

  }, [mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Mode connexion lente */}
      {showSlowConnectionMode && <SlowConnectionMode>{children}</SlowConnectionMode>}
      
      {/* Background flottant (désactivé si connexion lente) */}
      {showFloatingPills && !showSlowConnectionMode && <FloatingPillsBackground />}
      
      {/* Header avec sélecteur de langue */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/images/logo.png" alt="FasoHealth Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-lg font-bold text-teal-900">
                {currentLanguage === 'fr' && 'FasoHealth'}
                {currentLanguage === 'moore' && 'FasoHealth'}
                {currentLanguage === 'dioula' && 'FasoHealth'}
              </h1>
            </div>

            {/* Navigation et contrôles */}
            <div className="flex items-center gap-4">
              {/* Indicateur de connexion */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600 hidden sm:inline">
                  {currentLanguage === 'fr' && 'En ligne'}
                  {currentLanguage === 'moore' && 'En ligne'}
                  {currentLanguage === 'dioula' && 'En ligne'}
                </span>
              </div>

              {/* Sélecteur de langue */}
              {showLanguageSelector && <LanguageSelector />}

              {/* Menu mobile */}
              <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {showSlowConnectionMode ? children : (
          <div className="min-h-screen">
            {children}
          </div>
        )}
      </main>

      {/* Footer optimisé */}
      <footer className="relative z-10 bg-gray-50 border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {currentLanguage === 'fr' && 'À propos'}
                {currentLanguage === 'moore' && 'À propos'}
                {currentLanguage === 'dioula' && 'À propos'}
              </h3>
              <p className="text-gray-600 text-sm">
                {currentLanguage === 'fr' && 'FasoHealth - Plateforme médicale digitale pour l\'Afrique'}
                {currentLanguage === 'moore' && 'FasoHealth - Plateforme médicale digitale pour l\'Afrique'}
                {currentLanguage === 'dioula' && 'FasoHealth - Plateforme médicale digitale pour l\'Afrique'}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {currentLanguage === 'fr' && 'Contact'}
                {currentLanguage === 'moore' && 'Contact'}
                {currentLanguage === 'dioula' && 'Contact'}
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>📧 contact@fasohealth.bf</p>
                <p>📞 +226 XX XX XX XX</p>
                <p>📍 Ouagadougou, Burkina Faso</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {currentLanguage === 'fr' && 'Langues'}
                {currentLanguage === 'moore' && 'Langues'}
                {currentLanguage === 'dioula' && 'Langues'}
              </h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-200 rounded-full text-sm">🇫🇷 Français</span>
                <span className="px-3 py-1 bg-gray-200 rounded-full text-sm">🇧🇫 Moore</span>
                <span className="px-3 py-1 bg-gray-200 rounded-full text-sm">🇨🇮 Dioula</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>
              © 2024 FasoHealth. 
              {currentLanguage === 'fr' && ' Tous droits réservés.'}
              {currentLanguage === 'moore' && ' Tous droits réservés.'}
              {currentLanguage === 'dioula' && ' Tous droits réservés.'}
            </p>
          </div>
        </div>
      </footer>

      {/* Scripts d'optimisation */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Service Worker pour mode hors ligne
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {
              console.log('Service Worker registration failed');
            });
          }

          // Optimisation du chargement des images
          if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  const img = entry.target as HTMLImageElement;
                  if (img.dataset.src) {
                    img.src = img.dataset.src;
                  }
                  observer.unobserve(img);
                }
              });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
              imageObserver.observe(img);
            });
          }

          // Optimisation des polices
          if ('fonts' in document) {
            const font = new FontFace('CustomFont', 'url(/fonts/custom.woff2)');
            document.fonts.add(font);
          }

          // Précharger les pages critiques
          const criticalPages = ['/dashboard/patient', '/dashboard/doctor', '/search'];
          criticalPages.forEach(page => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = page;
            document.head.appendChild(link);
          });
        `
      }} />
    </div>
  );
}
