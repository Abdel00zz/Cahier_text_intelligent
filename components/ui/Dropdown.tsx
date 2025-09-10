
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

interface DropdownProps {
  buttonContent: React.ReactNode;
  children: React.ReactNode;
  buttonProps?: any;
}

export const Dropdown: React.FC<DropdownProps> = ({ buttonContent, children, buttonProps = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Position the menu using a portal with fixed positioning
  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current || !menuRef.current) return;
    const gap = 8;
    const rect = buttonRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Use menu's measured size (fallback to 256x auto)
    const mw = menuRef.current.offsetWidth || 256;
    const mh = menuRef.current.offsetHeight || 200;

    let top = rect.bottom + gap;
    let left = Math.min(Math.max(rect.right - mw, 8), vw - mw - 8);

    // Flip vertically if it would overflow bottom
    if (top + mh > vh - 8) {
      top = Math.max(rect.top - mh - gap, 8);
    }

    setMenuStyle({ top, left });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onScrollOrResize = () => setIsOpen(false);
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [isOpen]);

  const defaultButtonProps = {
    variant: 'icon',
    'data-tippy-content': "Plus d'actions"
  };

  const finalButtonProps = { ...defaultButtonProps, ...buttonProps };


  return (
    <div className="relative z-[60]" ref={dropdownRef}>
        <Button ref={buttonRef as any} onClick={() => setIsOpen(!isOpen)} {...finalButtonProps}>
            {buttonContent}
        </Button>
      
      {isOpen && createPortal(
        <div
          ref={menuRef}
          className="fixed w-64 bg-white rounded-md shadow-2xl border z-[70] py-1"
          style={menuStyle}
          role="menu"
        >
          {children}
        </div>,
        document.body
      )}
    </div>
  );
};

export const DropdownItem: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, onClick, ...props }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    }
    // Close dropdown after item click (find parent dropdown and close it)
    const dropdownMenu = e.currentTarget.closest('[role="menu"]');
    if (dropdownMenu) {
      // Trigger a click outside to close the dropdown
      setTimeout(() => {
        document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      }, 0);
    }
  };

  return (
    <button {...props} onClick={handleClick} className={`w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:bg-transparent ${className}`}>
        {children}
    </button>
  );
};

export const DropdownDivider: React.FC = () => <hr className="my-1 border-gray-200" />;