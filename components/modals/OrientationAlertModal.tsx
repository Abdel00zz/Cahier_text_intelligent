import React, { useEffect } from 'react';

interface OrientationAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrientationAlertModal: React.FC<OrientationAlertModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => {
      if (window.innerWidth > window.innerHeight) {
        onClose();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
      {/* Animation keyframes scoped to this component */}
      <style>{`
        @keyframes rotate-to-landscape {
          0% { transform: rotate(0deg); }
          35% { transform: rotate(90deg); }
          100% { transform: rotate(90deg); }
        }
      `}</style>
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-xs w-full text-center animate-zoom-in">
        <div className="mb-4">
          <div className="relative mx-auto w-16 h-16 mb-3">
            <div className="absolute inset-0 flex items-center justify-center">
              <i
                className="fas fa-mobile-alt text-4xl text-indigo-400"
                style={{ animation: 'rotate-to-landscape 1.2s ease-in-out forwards', transformOrigin: '50% 50%' }}
                aria-hidden="true"
              ></i>
            </div>
            <div className="absolute -top-1 -right-1 text-indigo-400/80 animate-pulse" aria-hidden="true">
              <i className="fas fa-undo-alt"></i>
            </div>
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Orientation paysage recommandée</h2>
          <p className="text-slate-600 text-sm">Pour une expérience optimale, tournez votre appareil en mode paysage.</p>
        </div>
        <button
          onClick={onClose}
          className="mt-2 w-full py-2 px-4 rounded-lg bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 transition-colors duration-200 active:scale-95 shadow"
        >
          J'ai compris
        </button>
      </div>
    </div>
  );
};
