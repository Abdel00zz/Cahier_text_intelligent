import React, { useEffect, useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { useOrientation } from '../hooks/useOrientation';

const HINT_STORAGE_KEY = 'hideMobileOrientationHint_v1';

export const MobileOrientationHint: React.FC = () => {
  const isMobile = useIsMobile();
  const orientation = useOrientation();
  const [hidden, setHidden] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HINT_STORAGE_KEY);
      setHidden(stored === '1');
    } catch {
      // ignore
    }
  }, []);

  const hidePermanently = () => {
    try { localStorage.setItem(HINT_STORAGE_KEY, '1'); } catch {}
    setHidden(true);
  };

  if (!isMobile || orientation === 'landscape' || hidden) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-6 pointer-events-none">
      <div className="mx-auto max-w-md pointer-events-auto">
        <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-4 flex items-start gap-3 animate-slide-in-up">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
            <i className="fas fa-mobile-screen text-white"></i>
          </div>
          <div className="flex-1">
            <p className="font-semibold">Astuce mobile • نصيحة للهاتف</p>
            <div className="text-sm text-slate-200 space-y-1">
              <p>Pour une meilleure lisibilité, tournez votre téléphone en mode paysage.</p>
              <p className="font-ar">لرؤية أوضح وتجربة أفضل، يُفضَّل تدوير الهاتف إلى الوضع الأفقي.</p>
            </div>
          </div>
          <div className="flex-shrink-0 flex flex-col items-end gap-2 ml-2">
            <button
              onClick={hidePermanently}
              className="text-xs bg-teal-600 hover:bg-teal-500 text-white px-2.5 py-1 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-teal-400"
              aria-label="Ne plus afficher"
            >
              Ne plus afficher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
