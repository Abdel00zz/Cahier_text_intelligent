import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MathJaxContext } from 'better-react-mathjax';
import { Dashboard } from './components/Dashboard';
import { Editor } from './components/Editor';
import { Spinner } from './components/ui/Spinner';
import { ClassInfo } from './types';
import { useClassManager } from './hooks/useClassManager';
import { Analytics } from '@vercel/analytics/react';
import { OrientationAlertModal } from './components/modals/OrientationAlertModal';


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
    const { isLoading: isClassManagerLoading } = useClassManager();
    const [showOrientationModal, setShowOrientationModal] = useState(false);
    const orientationTimerRef = useRef<number | null>(null);

    useEffect(() => {
      const dismissed = localStorage.getItem('orientationModalDismissed') === '1';

      const clearTimer = () => {
        if (orientationTimerRef.current !== null) {
          clearTimeout(orientationTimerRef.current);
          orientationTimerRef.current = null;
        }
      };

      const scheduleShow = () => {
        if (orientationTimerRef.current !== null) return; // déjà programmé
        orientationTimerRef.current = window.setTimeout(() => {
          setShowOrientationModal(true);
          orientationTimerRef.current = null;
        }, 3000);
      };

      const computeAndSet = () => {
        if (dismissed) {
          clearTimer();
          setShowOrientationModal(false);
          return;
        }
        // Exclusivement mobile: pointer grossier (pas de souris fine) ou UA mobile
        const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        const uaMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
        const isMobile = isCoarsePointer || uaMobile;
        const isPortrait = window.matchMedia && window.matchMedia('(orientation: portrait)').matches;

        if (isMobile && isPortrait) {
          scheduleShow();
        } else {
          clearTimer();
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
        clearTimer();
      };
    }, []);

    const handleSelectClass = useCallback((classInfo: ClassInfo) => {
        setActiveClass(classInfo);
        setView('editor');
    }, []);

    const handleBackToDashboard = useCallback(() => {
        setActiveClass(null);
        setView('dashboard');
    }, []);

    const handleCloseOrientationModal = () => {
      setShowOrientationModal(false);
      localStorage.setItem('orientationModalDismissed', '1');
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
          <OrientationAlertModal isOpen={showOrientationModal} onClose={handleCloseOrientationModal} />
        </div>
        <Analytics />
      </MathJaxContext>
    );
}

export default App;