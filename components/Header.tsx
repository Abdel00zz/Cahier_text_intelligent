import React from 'react';
import { ClassInfo } from '../types';
import { Button } from './ui/Button';

interface HeaderProps {
  classInfo: ClassInfo;
  establishmentName?: string;
  onClassInfoChange: (newInfo: Partial<ClassInfo>) => void;
  onBack?: () => void;
}

// Helper to detect Arabic characters in a string
const containsArabic = (text: string): boolean => /[\u0600-\u06FF]/.test(text || '');

const EditableHeader: React.FC<{ value: string; onSave: (value: string) => void }> = ({ value, onSave }) => {
  const handleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    onSave(e.currentTarget.textContent || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const isArabic = containsArabic(value);

  return (
    <span
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`inline-block px-2 py-1 -mx-2 -my-1 rounded-md hover:bg-teal-100/50 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-text ${isArabic ? 'font-ar' : 'font-slab'}`}
    >
      {value}
    </span>
  );
};

export const Header: React.FC<HeaderProps> = React.memo(({ classInfo, establishmentName, onClassInfoChange, onBack }) => {
  return (
    <div className="flex items-center justify-center relative mb-6 pb-4 group">
      {onBack && (
        <div className="absolute left-0">
          <Button 
            variant="icon" 
            size="md" 
            onClick={onBack} 
            data-tippy-content="Retour au tableau de bord"
            className="bg-slate-100 hover:bg-slate-200"
          >
            <i className="fas fa-arrow-left"></i>
          </Button>
        </div>
      )}
      <header className="text-center">
        {establishmentName && (
          <p className="text-sm font-semibold text-slate-500 mb-1">{establishmentName}</p>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-teal-800 font-slab">
          <EditableHeader value={classInfo.name} onSave={(v) => onClassInfoChange({ name: v })} />
        </h1>
        <h2 className="text-lg sm:text-xl font-semibold text-slate-600 font-slab mt-1">
          Enseignant: {classInfo.teacherName}
        </h2>
        <p className="text-xs text-slate-400 mt-2 italic opacity-70 transition-opacity md:opacity-0 md:group-hover:opacity-100">
          Cliquez sur le nom de la classe pour modifier
        </p>
      </header>
    </div>
  );
});