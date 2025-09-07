import React, { FC, useState, useEffect, useRef } from 'react';

interface MobileDateModalProps {
  isOpen: boolean;
  initialDate?: string;
  onClose: () => void;
  onSave: (date: string) => void;
}

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

const quickOptions = [
  { label: 'Aujourd\'hui', date: today },
  { label: 'Demain', date: tomorrow },
  { label: 'Effacer', date: null },
];

// Helper to parse YYYY-MM-DD string as local date to avoid timezone issues
const parseDateString = (dateString: string): Date | null => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length !== 3) return null;
  const [year, month, day] = parts.map(Number);
  const date = new Date(year, month - 1, day);
  // Check if the created date is valid and corresponds to the input
  if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
    return date;
  }
  return null;
};

// Helper to format a Date object into a YYYY-MM-DD string
const formatDate = (date: Date | null): string => {
  return date ? date.toISOString().slice(0, 10) : '';
};

export const MobileDateModal: FC<MobileDateModalProps> = ({ isOpen, initialDate, onClose, onSave }) => {
  const [selectedDate, setSelectedDate] = useState(() => parseDateString(initialDate || ''));
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedDate(parseDateString(initialDate || ''));
  }, [initialDate, isOpen]);

  const handleSelect = (date: Date | null) => {
    onSave(formatDate(date));
    onClose();
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    const parsed = parseDateString(dateValue);
    setSelectedDate(parsed);
    onSave(dateValue); // Save the raw string value from the input
    onClose();
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-fade-in">
      <div 
        ref={modalRef}
        className="bg-white w-full rounded-t-2xl shadow-lg p-4 animate-slide-in-up-mobile"
      >
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
        <div className="grid grid-cols-3 gap-3">
          {quickOptions.map(option => (
            <button
              key={option.label}
              onClick={() => handleSelect(option.date)}
              className={`
                p-3 rounded-xl text-center transition-all duration-200
                ${option.date === null ? 'bg-slate-100 text-slate-700' : 'bg-teal-50 text-teal-800'}
                ${selectedDate && option.date && selectedDate.toDateString() === option.date.toDateString() ? 'ring-2 ring-teal-500' : ''}
                active:scale-95
              `}
            >
              <span className="font-semibold text-sm">{option.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-4">
          <input
            type="date"
            value={formatDate(selectedDate)}
            onChange={handleDateInputChange}
            className="w-full p-3 rounded-xl bg-slate-100 border-transparent focus:ring-2 focus:ring-teal-500 text-center text-slate-800"
          />
        </div>
      </div>
    </div>
  );
};
