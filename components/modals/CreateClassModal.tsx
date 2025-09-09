

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (details: { name: string; subject: string; }) => void;
  defaultTeacherName?: string;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({ isOpen, onClose, onCreate, defaultTeacherName = '' }) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
      setName('');
      setSubject('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && subject.trim()) {
      onCreate({ name: name.trim(), subject: subject.trim() });
    }
  };
  
  const isFormValid = name.trim() && subject.trim();

  if (!isOpen) return null;

  const inputClasses = "w-full bg-slate-100 border-slate-200 border rounded-lg px-4 py-3 text-base sm:text-sm sm:px-3 sm:py-2 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors";
  const labelClasses = "block text-sm font-medium text-slate-700 mb-2";

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md animate-slide-in-up flex flex-col max-h-[94vh] sm:max-h-[86vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-class-title"
      >
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
          <div className="px-4 py-3 border-b border-slate-200 flex-shrink-0">
            <h2 id="create-class-title" className="text-base sm:text-base font-semibold font-slab text-slate-900">Créer une nouvelle classe</h2>
          </div>
          <div className="p-4 space-y-4 flex-1 overflow-y-auto overscroll-contain">
            <div>
              <label htmlFor="className" className={labelClasses}>Nom de la classe *</label>
              <input 
                ref={nameInputRef}
                type="text" 
                id="className" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className={inputClasses} 
                placeholder="Ex: 2ème Bac Scientifique" 
              />
            </div>
             <div>
              <label htmlFor="subject" className={labelClasses}>Matière *</label>
              <input 
                type="text" 
                id="subject" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                required 
                className={inputClasses} 
                placeholder="Ex: Mathématiques" 
              />
            </div>
            <p className="text-xs text-slate-500 pt-2">
              Le nom de l'enseignant (<span className="font-semibold">{defaultTeacherName || 'non défini'}</span>) sera repris des paramètres par défaut.
            </p>
          </div>
          <div className="p-3 bg-slate-50 flex justify-end gap-3 rounded-b-none sm:rounded-b-2xl border-t border-slate-200 flex-shrink-0">
            <Button type="button" onClick={onClose} variant="secondary" className="h-11 sm:h-9 px-5 sm:px-4">Annuler</Button>
            <Button type="submit" variant="primary" disabled={!isFormValid} className="h-11 sm:h-9 px-5 sm:px-4">Créer la classe</Button>
          </div>
        </form>
      </div>
    </div>
  );
};