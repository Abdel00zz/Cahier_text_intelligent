

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

  const inputClasses = "w-full bg-slate-100 border-slate-200 border rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors";
  const labelClasses = "block text-sm font-medium text-slate-700 mb-2";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold font-slab text-slate-900">Créer une nouvelle classe</h2>
          </div>
          <div className="p-6 space-y-5">
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
          <div className="p-4 bg-slate-50 flex justify-end gap-3 rounded-b-2xl border-t border-slate-200">
            <Button type="button" onClick={onClose} variant="secondary">Annuler</Button>
            <Button type="submit" variant="primary" disabled={!isFormValid}>Créer la classe</Button>
          </div>
        </form>
      </div>
    </div>
  );
};