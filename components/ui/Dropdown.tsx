
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
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({ 
    position: 'fixed',
    top: -9999, 
    left: -9999, 
    opacity: 0,
    visibility: 'hidden',
    transform: 'scale(0.95)',
    transformOrigin: 'top right'
  });
  const [isPositioned, setIsPositioned] = useState(false);
  const positionTimeoutRef = useRef<number>();

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

  // Reset positioning state when menu closes
  useEffect(() => {
    if (!isOpen) {
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }
      setIsPositioned(false);
      setMenuStyle(prev => ({ 
        ...prev,
        opacity: 0,
        visibility: 'hidden',
        transform: 'scale(0.95)'
      }));
    }
  }, [isOpen]);

  // Intelligent positioning system
  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) {
      setIsPositioned(false);
      return;
    }
    
    const calculatePosition = () => {
      if (!buttonRef.current || !menuRef.current) return null;
      
      const gap = 8;
      const rect = buttonRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      
      // Force layout calculation
      menuRef.current.style.visibility = 'hidden';
      menuRef.current.style.opacity = '1';
      menuRef.current.style.transform = 'none';
      
      const mw = menuRef.current.offsetWidth || 256;
      const mh = menuRef.current.offsetHeight || 200;
      
      // Smart positioning logic
      let top = rect.bottom + gap;
      let left = rect.right - mw;
      let transformOrigin = 'top right';
      
      // Horizontal adjustments
      if (left < gap) {
        left = rect.left;
        transformOrigin = 'top left';
      }
      if (left + mw > vw - gap) {
        left = Math.max(gap, vw - mw - gap);
        transformOrigin = 'top right';
      }
      
      // Vertical adjustments
      if (top + mh > vh - gap) {
        top = Math.max(gap, rect.top - mh - gap);
        transformOrigin = transformOrigin.replace('top', 'bottom');
      }
      
      return { top, left, transformOrigin, mw, mh };
    };
    
    const positionMenu = () => {
      const position = calculatePosition();
      if (!position) return;
      
      const { top, left, transformOrigin } = position;
      
      setMenuStyle({
        position: 'fixed',
        top,
        left,
        opacity: 1,
        visibility: 'visible',
        transform: 'scale(1)',
        transformOrigin,
        transition: 'opacity 150ms ease-out, transform 150ms ease-out'
      });
      setIsPositioned(true);
    };
    
    // Multi-stage positioning for maximum reliability
    if (menuRef.current) {
      // Stage 1: Immediate positioning if dimensions available
      if (menuRef.current.offsetWidth > 0) {
        positionMenu();
      } else {
        // Stage 2: Wait for next frame
        positionTimeoutRef.current = window.requestAnimationFrame(() => {
          if (menuRef.current?.offsetWidth > 0) {
            positionMenu();
          } else {
            // Stage 3: Fallback with small delay
            positionTimeoutRef.current = window.setTimeout(positionMenu, 10);
          }
        });
      }
    }
    
    return () => {
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
        cancelAnimationFrame(positionTimeoutRef.current);
      }
    };
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
        <Button 
          ref={buttonRef as any} 
          onClick={() => setIsOpen(!isOpen)} 
          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-200"
          {...finalButtonProps}
        >
            {buttonContent}
        </Button>
      
      {isOpen && createPortal(
        <>
          {/* Backdrop pour fermer sur mobile */}
          <div 
            className="fixed inset-0 bg-black/5 z-[65] md:hidden" 
            onClick={() => setIsOpen(false)}
          />
          <div
            ref={menuRef}
            className="min-w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-[70] py-1 max-h-[80vh] overflow-y-auto overscroll-contain"
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
          </div>
        </>,
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
        <button 
            {...props} 
            onClick={handleClick} 
            className={`w-full text-left flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:bg-transparent transition-colors duration-150 material-focus ${className}`}
        >
            {children}
        </button>
    );
};

export const DropdownDivider: React.FC = () => <hr className="my-1 border-gray-200" />;