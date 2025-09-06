
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';

interface DropdownProps {
  buttonContent: React.ReactNode;
  children: React.ReactNode;
  buttonProps?: any;
}

export const Dropdown: React.FC<DropdownProps> = ({ buttonContent, children, buttonProps = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const defaultButtonProps = {
    variant: 'icon',
    'data-tippy-content': "Plus d'actions"
  };

  const finalButtonProps = { ...defaultButtonProps, ...buttonProps };


  return (
    <div className="relative" ref={dropdownRef}>
        <Button onClick={() => setIsOpen(!isOpen)} {...finalButtonProps}>
            {buttonContent}
        </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-xl border z-30 py-1" onClick={() => setIsOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button {...props} className={`w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:bg-transparent ${className}`}>
        {children}
    </button>
);

export const DropdownDivider: React.FC = () => <hr className="my-1 border-gray-200" />;