import React, { useState, useRef, useEffect, forwardRef } from 'react';

interface QuickDateInputProps {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  className?: string;
}

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

export const QuickDateInput = forwardRef<HTMLInputElement, QuickDateInputProps>(
  ({ value, onSave, onCancel, className }, ref) => {
    const [inputValue, setInputValue] = useState(value);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const suggestions = [
      { label: "Aujourd'hui", value: formatDate(today) },
      { label: "Demain", value: formatDate(tomorrow) },
      { label: "Effacer", value: '' },
    ];

    useEffect(() => {
      setInputValue(value);
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSave(inputValue);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    const handleSuggestionClick = (suggestionValue: string) => {
      onSave(suggestionValue);
    };

    const handleBlur = (e: React.FocusEvent) => {
      // Use relatedTarget to see if the focus is moving within the component
      if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
        onCancel();
      }
    };

    return (
      <div ref={containerRef} className="relative" onBlur={handleBlur}>
        <input
          ref={ref}
          type="date"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          className={`${className} h-10 px-3 py-2 text-base rounded-lg border-2 border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all duration-200`}
          aria-label="Modifier la date"
        />
        
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-300 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                onClick={() => handleSuggestionClick(suggestion.value)}
                className="w-full px-4 py-3 text-left text-base hover:bg-teal-50 active:bg-teal-100 flex items-center justify-between group transition-colors duration-150 font-medium"
              >
                <span className="text-slate-700 group-hover:text-teal-700">{suggestion.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);
