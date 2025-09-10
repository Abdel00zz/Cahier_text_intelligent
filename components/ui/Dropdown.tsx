
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
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target) &&
          menuRef.current && !menuRef.current.contains(target)) {
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

    // Default: position below and align to the right of the button
    let top = rect.bottom + gap;
    let left = rect.right - mw;

    // Adjust horizontal position to stay within viewport
    if (left < 8) {
      left = rect.left; // Align to left of button
    }
    if (left + mw > vw - 8) {
      left = vw - mw - 8; // Push left to fit in viewport
    }

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
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === DropdownItem) {
              return React.cloneElement(child as React.ReactElement<any>, {
                onDropdownClose: () => setIsOpen(false)
              });
            }
            return child;
          })}
        </div>,
        document.body
      )}
    </div>
  );
};

export const DropdownItem: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { onDropdownClose?: () => void }> = ({ children, className, onClick, onDropdownClose, ...props }) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (onClick) {
            onClick(e);
        }
        // Close dropdown after a small delay to allow the action to complete
        setTimeout(() => {
            if (onDropdownClose) {
                onDropdownClose();
            }
        }, 50);
    };
    
    return (
        <button {...props} onClick={handleClick} className={`w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:bg-transparent ${className}`}>
            {children}
        </button>
    );
};

export const DropdownDivider: React.FC = () => <hr className="my-1 border-gray-200" />;