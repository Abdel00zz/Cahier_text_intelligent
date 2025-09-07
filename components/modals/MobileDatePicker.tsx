import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';

interface MobileDatePickerProps {
  isOpen: boolean;
  initialDate?: string;
  onClose: () => void;
  onSave: (date: string | '') => void;
}

export const MobileDatePicker: React.FC<MobileDatePickerProps> = ({ isOpen, initialDate, onClose, onSave }) => {
  const [value, setValue] = useState<string>(initialDate || '');

  useEffect(() => {
    if (isOpen) setValue(initialDate || '');
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold font-slab text-slate-900">Choisir une date</h3>
          <button onClick={onClose} aria-label="Fermer" className="text-slate-500 hover:text-slate-700"><i className="fas fa-times"></i></button>
        </div>
        <div className="p-4 space-y-4">
          <input
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full h-12 text-center border-2 border-teal-500 rounded-lg shadow-inner bg-white focus:outline-none"
          />
          <div className="flex items-center justify-between gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setValue(new Date().toISOString().slice(0,10))}>
              <i className="fas fa-calendar-day mr-2" /> Aujourd'hui
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => setValue('')}>
              <i className="fas fa-eraser mr-2" /> Effacer
            </Button>
          </div>
        </div>
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button variant="primary" onClick={() => { onSave(value); onClose(); }}>Enregistrer</Button>
        </div>
      </div>
    </div>
  );
};
