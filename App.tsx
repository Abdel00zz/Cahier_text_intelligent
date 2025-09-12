import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MathJaxContext } from 'better-react-mathjax';
import { Dashboard } from './components/Dashboard';
import { Editor } from './components/Editor';
import { Spinner } from './components/ui/Spinner';
import { ClassInfo } from './types';
import { useClassManager } from './hooks/useClassManager';
import { Analytics } from '@vercel/analytics/react';
import { OrientationAlertModal } from './components/modals/OrientationAlertModal';
import { Capacitor } from '@capacitor/core';
import { WebviewPrint } from 'capacitor-webview-print';


declare global {
  interface Window {
    tippy: (targets: any, options?: any) => any;
  }
}

const mathJaxConfig = {
  loader: { load: ["input/tex", "output/chtml"] },
  tex: {
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    displayMath: [["$$", "$$"], ["\\[", "\\]"]],
  },
};

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [activeClass, setActiveClass] = useState<ClassInfo | null>(null);
  const { classes, isLoading: isClassManagerLoading } = useClassManager();
  const [showOrientationModal, setShowOrientationModal] = useState(false);
  const orientationTimerRef = useRef<number | null>(null);
  
  // Initialiser le plugin WebviewPrint au démarrage de l'application
  useEffect(() => {
    const initializePlugins = async () => {
      try {
        console.log('Initialisation des plugins Capacitor...');
        console.log('Plateforme:', Capacitor.getPlatform());
        console.log('Plugin WebviewPrint disponible:', !!WebviewPrint);
        
        if (Capacitor.getPlatform() === 'android' && WebviewPrint) {
          console.log('WebviewPrint initialisé avec succès');
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des plugins:', error);
      }
    };
    
    initializePlugins();
  }, []);

    // Helper to know if we should show the orientation alert (mobile + portrait)
    const isMobilePortrait = useCallback(() => {
      const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      const uaMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
      const isMobile = isCoarsePointer || uaMobile;
      const isPortrait = window.matchMedia && window.matchMedia('(orientation: portrait)').matches;
      return isMobile && isPortrait;
    }, []);

    const clearOrientationTimer = useCallback(() => {
      if (orientationTimerRef.current !== null) {
        clearTimeout(orientationTimerRef.current);
        orientationTimerRef.current = null;
      }
    }, []);

    const scheduleOrientationModal = useCallback(() => {
      if (orientationTimerRef.current !== null) return; // deja programmé
      orientationTimerRef.current = window.setTimeout(() => {
        setShowOrientationModal(true);
        orientationTimerRef.current = null;
      }, 3000);
    }, []);

    useEffect(() => {
      if (view !== 'editor') {
        // Disable and hide modal when not in editor
        clearOrientationTimer();
        setShowOrientationModal(false);
        return;
      }

      const computeAndSet = () => {
        if (isMobilePortrait()) {
          scheduleOrientationModal();
        } else {
          clearOrientationTimer();
          setShowOrientationModal(false);
        }
      };

      computeAndSet();
      const handler = () => computeAndSet();
      window.addEventListener('resize', handler);
      window.addEventListener('orientationchange', handler as any);
      return () => {
        window.removeEventListener('resize', handler);
        window.removeEventListener('orientationchange', handler as any);
        clearOrientationTimer();
      };
    }, [view, clearOrientationTimer, isMobilePortrait, scheduleOrientationModal]);

    const handleSelectClass = useCallback((classInfo: ClassInfo) => {
        setActiveClass(classInfo);
        setView('editor');
    }, []);

  // Removed auto-open: app now stays on dashboard until a class is selected

    const handleBackToDashboard = useCallback(() => {
        setActiveClass(null);
        setView('dashboard');
    }, []);

    const handleCloseOrientationModal = () => {
      // Close now, but if user remains in portrait on mobile, re-prompt after 3s
      setShowOrientationModal(false);
      clearOrientationTimer();
      if (isMobilePortrait()) {
        scheduleOrientationModal();
      }
    };

    const renderContent = () => {
        if (isClassManagerLoading) {
            return <Spinner fullPage text="Chargement de l'application..." />;
        }

        if (view === 'editor' && activeClass) {
            return <Editor classInfo={activeClass} onBack={handleBackToDashboard} />;
        }

        return <Dashboard onSelectClass={handleSelectClass} />;
    };

    return (
      <MathJaxContext config={mathJaxConfig}>
        <div className="min-h-screen bg-slate-100 text-slate-800">
          {renderContent()}
          {view === 'editor' && (
            <OrientationAlertModal isOpen={showOrientationModal} onClose={handleCloseOrientationModal} />
          )}
        </div>
        <Analytics />
      </MathJaxContext>
    );
}

export default App;