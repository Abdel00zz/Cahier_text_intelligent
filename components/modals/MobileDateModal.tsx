import React, { FC, useState, useEffect, useRef } from 'react';
import { formatDateDDMMYYYY } from '../../utils/dataUtils';

interface MobileDateModalProps {
  isOpen: boolean;
  initialDate?: string;
  onClose: () => void;
  onSave: (date: string) => void;
}

// Create timezone-neutral dates for today and tomorrow
const localNow = new Date();
const today = new Date(Date.UTC(localNow.getFullYear(), localNow.getMonth(), localNow.getDate()));
const tomorrow = new Date(Date.UTC(localNow.getFullYear(), localNow.getMonth(), localNow.getDate() + 1));

const quickOptions = [
  { label: 'Aujourd\'hui', date: today },
  { label: 'Demain', date: tomorrow },
  { label: 'Effacer', date: null },
];

// Helper to parse various date string formats into a UTC date
const parseDateString = (dateString: string): Date | null => {
  if (!dateString) return null;

  // Try DD/MM/YYYY
  const slashParts = dateString.split('/');
  if (slashParts.length === 3) {
    const [day, month, year] = slashParts.map(Number);
    if (day > 0 && day <= 31 && month > 0 && month <= 12 && year > 1900) {
        // Create date in UTC to avoid timezone shifts
        const date = new Date(Date.UTC(year, month - 1, day));
        if (date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day) {
            return date;
        }
    }
  }

  // Try YYYY-MM-DD
  const dashParts = dateString.split('-');
  if (dashParts.length === 3) {
    const [year, month, day] = dashParts.map(Number);
    // Create date in UTC
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day) {
        return date;
    }
  }

  return null;
};

// Helper to format a UTC Date object into a YYYY-MM-DD string for saving
const formatDateForSave = (date: Date | null): string => {
  if (!date) return '';
  // Use getUTC methods to extract components and format manually
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const MobileDateModal: FC<MobileDateModalProps> = ({ isOpen, initialDate, onClose, onSave }) => {
  const [inputValue, setInputValue] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue(initialDate ? formatDateDDMMYYYY(initialDate) ?? '' : '');
    }
  }, [initialDate, isOpen]);

  const handleQuickSelect = (date: Date | null) => {
    onSave(formatDateForSave(date));
    onClose();
  };

  const handleSave = () => {
    const parsedDate = parseDateString(inputValue);
    onSave(formatDateForSave(parsedDate));
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value; // YYYY-MM-DD
    if (dateValue) {
        const parsed = parseDateString(dateValue);
        if (parsed) {
            setInputValue(formatDateDDMMYYYY(dateValue) ?? '');
        }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in p-4">
      <div 
        ref={modalRef}
        className="bg-white w-full max-w-xs rounded-2xl shadow-lg p-5 animate-zoom-in"
      >
        <h3 className="text-lg font-bold text-center text-slate-800 mb-4">Modifier la date</h3>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          {quickOptions.map(option => (
            <button
              key={option.label}
              onClick={() => handleQuickSelect(option.date)}
              className={`p-2 rounded-lg text-center transition-all duration-200 text-sm font-semibold
                ${option.date === null ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800'}
                active:scale-95`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="relative flex items-center bg-slate-100 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500">
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="JJ/MM/AAAA"
                className="w-full p-3 bg-transparent text-center text-slate-800 font-medium focus:outline-none"
                autoFocus
            />
            <button 
                onClick={() => dateInputRef.current?.showPicker()}
                className="absolute right-0 p-3 text-slate-500 hover:text-indigo-600"
                aria-label="Ouvrir le calendrier"
            >
                <i className="fas fa-calendar-alt"></i>
            </button>
            <input
                ref={dateInputRef}
                type="date"
                onChange={handleNativeDateChange}
                className="opacity-0 w-0 h-0 absolute"
            />
        </div>

        <div className="mt-5 flex flex-col gap-2">
            <button
                onClick={handleSave}
                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors duration-200 active:scale-95 shadow-lg shadow-indigo-500/20"
            >
                Enregistrer
            </button>
            <button
                onClick={onClose}
                className="w-full px-4 py-2 text-slate-600 rounded-xl font-medium hover:bg-slate-100 transition-colors duration-200"
            >
                Annuler
            </button>
        </div>
      </div>
    </div>
  );
};
