import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'red' | 'blue' | 'neutral';
  className?: string;
  glow?: boolean;
  border?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  rounded?: '2xl' | '3xl' | 'default';
}

/**
 * Base Card component with Glassmorphism and specialized variants.
 */
export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'neutral', 
  className = '', 
  glow = false,
  border = true,
  padding = 'md',
  onClick,
  rounded = 'default'
}) => {
  const variantStyles = {
    red: 'border-red-900/30 group-hover:border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.1)]',
    blue: 'border-blue-900/30 group-hover:border-blue-500/50 shadow-[0_0_30px_rgba(37,99,235,0.1)]',
    neutral: 'border-neutral-800/60 group-hover:border-white/10 shadow-lg'
  };

  const glowStyles = {
    red: 'bg-red-600/10 group-hover:bg-red-600/20',
    blue: 'bg-blue-600/10 group-hover:bg-blue-600/20',
    neutral: 'bg-white/5'
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6 md:p-8',
    lg: 'p-8 md:p-10',
    xl: 'p-10 md:p-14'
  };

  const roundedStyles = {
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    'default': 'rounded-[2.5rem]'
  };

  return (
    <div 
      onClick={onClick}
      className={`
        relative group bg-neutral-900/80 backdrop-blur-2xl transition-all duration-500 overflow-hidden
        ${roundedStyles[rounded]}
        ${border ? `border ${variantStyles[variant]}` : ''}
        ${paddingStyles[padding]}
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${className}
      `}
    >
      {/* Background glow effect */}
      {glow && (
        <div className={`
          absolute top-0 right-0 w-[400px] h-[400px] blur-[100px] rounded-full -z-10 transition-all duration-700 pointer-events-none mix-blend-screen
          ${glowStyles[variant]}
        `} />
      )}
      
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
