

import React, { useState, useEffect, useRef } from 'react';
import { Cycle } from '../../types';
import { Button } from '../ui/Button';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (details: { name: string; subject: string; cycle?: Cycle; }) => void;
  defaultTeacherName?: string;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({ isOpen, onClose, onCreate, defaultTeacherName = '' }) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [cycle, setCycle] = useState<Cycle>('college');
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
  onCreate({ name: name.trim(), subject: subject.trim(), cycle });
    }
  };
  
  const isFormValid = name.trim() && subject.trim();

  if (!isOpen) return null;

  const inputClasses = "w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 material-focus";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-md animate-slide-in-up flex flex-col max-h-[94vh] sm:max-h-[86vh] overflow-hidden elevation-3"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-class-title"
      >
        {/* Material Design Drag Handle (mobile) */}
        <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-gray-300"></div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
          {/* Material Design Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <i className="fas fa-plus text-blue-600 text-sm"></i>
              </div>
              <h2 id="create-class-title" className="text-xl font-medium text-gray-900">Créer une nouvelle classe</h2>
            </div>
            <button type="button" onClick={onClose} className="w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 transition-colors duration-200 flex items-center justify-center">
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto overscroll-contain">
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
              <label htmlFor="cycle" className={labelClasses}>Cycle *</label>
              <select
                id="cycle"
                value={cycle}
                onChange={(e) => setCycle(e.target.value as Cycle)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 material-focus"
              >
                <option value="college">Collège</option>
                <option value="lycee">Lycée</option>
                <option value="prepa">Classe préparatoire</option>
              </select>
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
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <i className="fas fa-info text-blue-600 text-xs"></i>
                </div>
                <p className="text-sm text-blue-800">
                  Le nom de l'enseignant (<span className="font-medium">{defaultTeacherName || 'non défini'}</span>) sera repris des paramètres par défaut.
                </p>
              </div>
            </div>
          </div>
          
          {/* Material Design Footer */}
          <div className="p-6 bg-white border-t border-gray-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 material-focus"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={!isFormValid} 
              className={`inline-flex items-center gap-2 h-10 px-6 rounded-full text-white text-sm font-medium transition-all duration-200 elevation-1 hover:elevation-2 material-focus ${
                isFormValid 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <i className="fas fa-plus text-sm"></i>
              Créer la classe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};