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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" aria-labelledby="orientation-title">
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-3 max-w-[300px] w-[88%] text-center">
        <h2 id="orientation-title" className="text-sm font-semibold text-slate-800">Mode paysage conseillé</h2>
        <p className="text-xs text-slate-600 mt-1">Tournez votre téléphone pour une meilleure lisibilité.</p>
        <button
          onClick={onClose}
          className="mt-3 w-full h-9 px-3 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 active:opacity-90"
        >
          OK
        </button>
      </div>
    </div>
  );
};
