import React, { useState, useRef, useEffect, forwardRef } from 'react';

interface QuickDateInputProps {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  className?: string;
}

export const QuickDateInput = forwardRef<HTMLInputElement, QuickDateInputProps>(
  ({ value, onSave, onCancel, className }, ref) => {
    const [inputValue, setInputValue] = useState(value);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const suggestions = [
      { label: "Aujourd'hui", value: today.toISOString().slice(0, 10), shortcut: 'a' },
      { label: "Demain", value: tomorrow.toISOString().slice(0, 10), shortcut: 'd' },
      { label: "Effacer", value: '', shortcut: 'e' },
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
      } else if (e.ctrlKey || e.metaKey) {
        const shortcut = suggestions.find(s => s.shortcut === e.key.toLowerCase());
        if (shortcut) {
          e.preventDefault();
          onSave(shortcut.value);
        }
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
          className={className}
          aria-label="Modifier la date"
        />
        
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                onClick={() => handleSuggestionClick(suggestion.value)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-teal-50 flex items-center justify-between group"
              >
                <span className="text-slate-700 group-hover:text-teal-700">{suggestion.label}</span>
                <span className="text-xs text-slate-400 group-hover:text-teal-500">
                  Ctrl+{suggestion.shortcut}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);
