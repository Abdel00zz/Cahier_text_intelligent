import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  'data-tippy-content'?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none';
  
  const variantClasses = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-sm hover:shadow-md hover:-translate-y-0.5',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md hover:-translate-y-0.5',
    icon: 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-teal-600 focus:ring-teal-500 rounded-full',
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: `text-sm ${variant === 'icon' ? 'w-9 h-9' : 'px-4 py-2'}`,
    lg: `text-base ${variant === 'icon' ? 'w-12 h-12' : 'px-6 py-3'}`,
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};