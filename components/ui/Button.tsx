import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  'data-tippy-content'?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium focus:outline-none transition-all duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none';
  
  const variantClasses = {
    primary: 'text-black hover:text-white hover:bg-black active:bg-black/80 border-b-2 border-black hover:border-transparent',
    secondary: 'text-gray-800 hover:text-white hover:bg-gray-800 active:bg-gray-700 border-b-2 border-gray-300 hover:border-transparent',
    danger: 'text-red-600 hover:text-white hover:bg-red-600 active:bg-red-700 border-b-2 border-red-300 hover:border-transparent',
    icon: 'text-gray-700 hover:text-white hover:bg-gray-800 active:bg-gray-700 rounded-full',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: `text-sm ${variant === 'icon' ? 'w-8 h-8' : 'px-3 py-1.5'}`,
    lg: `text-base ${variant === 'icon' ? 'w-10 h-10' : 'px-4 py-2'}`,
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};