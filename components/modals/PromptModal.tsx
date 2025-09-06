

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  label: string;
}

export const PromptModal: React.FC<PromptModalProps> = ({ isOpen, onClose, onConfirm, title, label }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setValue('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

  if (!isOpen) return null;

  const inputClasses = "w-full bg-slate-100 border-slate-200 border rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors";
  const labelClasses = "block text-sm font-medium text-slate-700 mb-2";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold font-slab text-slate-900">{title}</h2>
          </div>
          <div className="p-6">
            <label htmlFor="prompt-input" className={labelClasses}>{label}</label>
            <input
              ref={inputRef}
              type="text"
              id="prompt-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={inputClasses}
              required
            />
          </div>
          <div className="p-4 bg-slate-50 flex justify-end gap-3 rounded-b-2xl border-t border-slate-200">
            <Button type="button" onClick={onClose} variant="secondary">Annuler</Button>
            <Button type="submit" variant="primary" disabled={!value.trim()}>Confirmer</Button>
          </div>
        </form>
      </div>
    </div>
  );
};