import React, { useState, useRef, useEffect } from 'react';

interface QuickDateInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  className?: string;
}

export const QuickDateInput: React.FC<QuickDateInputProps> = ({ value, onChange, onBlur, onKeyDown, className }) => {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    
    // Show suggestions when typing or field is empty
    setShowSuggestions(newValue.length === 0 || newValue.length < 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Quick shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'a':
          e.preventDefault();
          onChange(suggestions[0].value);
          onBlur();
          return;
        case 'd':
          e.preventDefault();
          onChange(suggestions[1].value);
          onBlur();
          return;
        case 'e':
          e.preventDefault();
          onChange('');
          onBlur();
          return;
      }
    }
    
    onKeyDown(e);
  };

  const handleSuggestionClick = (suggestionValue: string) => {
    onChange(suggestionValue);
    onBlur();
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleBlurCapture = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!e.currentTarget.contains(document.activeElement)) {
        setShowSuggestions(false);
        onBlur();
      }
    }, 150);
  };

  return (
    <div className="relative" onBlur={handleBlurCapture}>
      <input
        ref={inputRef}
        type="date"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        className={className}
        aria-label="Modifier la date"
      />
      
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
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
};
