
import React, { useState, useEffect, useRef } from 'react';

interface EditableCellProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}

export const EditableCell: React.FC<EditableCellProps> = ({ value, onSave, className = '', multiline = false, placeholder = "Cliquer pour éditer" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  // Update internal state if external value changes while not editing
  useEffect(() => {
    if (!isEditing) {
      setCurrentValue(value);
    }
  }, [value, isEditing]);


  const handleSave = () => {
    setIsEditing(false);
    // Only save if the value has actually changed
    if (currentValue !== value) {
      onSave(currentValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || (!multiline && !e.shiftKey))) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setCurrentValue(value); // Revert changes
    }
  };

  const commonInputProps = {
    ref: inputRef as any,
    value: currentValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCurrentValue(e.target.value),
    onBlur: handleSave,
    onKeyDown: handleKeyDown,
    placeholder: placeholder,
    className: `w-full h-full p-2 bg-white border-2 border-teal-500 rounded-md shadow-inner z-10 focus:outline-none ${className}`
  };

  if (isEditing) {
    return multiline ? (
      <textarea {...commonInputProps} rows={3} />
    ) : (
      <input type="text" {...commonInputProps} />
    );
  }

  return (
    <div
      onDoubleClick={() => setIsEditing(true)}
      className={`min-h-[1.5rem] focus:bg-white rounded cursor-text break-words whitespace-pre-wrap ${className}`}
      title="Double-cliquez pour modifier"
    >
      {value ? value : <span className="text-slate-400 italic">{placeholder}</span>}
    </div>
  );
};
