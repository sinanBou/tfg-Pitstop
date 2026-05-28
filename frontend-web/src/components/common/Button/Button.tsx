import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  glow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  glow = true,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseStyles = 'px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all duration-300 select-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-red-600 hover:bg-red-500 text-white border border-transparent',
    secondary: 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-850 hover:border-neutral-700',
    danger: 'bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40',
    ghost: 'bg-transparent hover:bg-white/5 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700',
  };

  const glowStyles = '';

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${glowStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
