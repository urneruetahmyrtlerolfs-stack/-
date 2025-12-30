
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  loading = false,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100";
  const variants = {
    primary: "bg-[#FFB7C5] text-white hover:bg-[#ff9eaf] shadow-sm",
    secondary: "bg-[#87CEEB] text-white hover:bg-[#6ab8db] shadow-sm",
    danger: "bg-red-400 text-white hover:bg-red-500 shadow-sm",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    outline: "bg-transparent border-2 border-[#FFB7C5] text-[#FFB7C5] hover:bg-pink-50",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin mr-2" />}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

export const Input: React.FC<{
  label?: string;
  error?: string;
  className?: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>> = ({ label, error, className = '', hint, ...props }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && <label className="text-xs font-bold text-gray-600 ml-1">{label}</label>}
    <input 
      className={`px-4 py-2.5 rounded-xl border-2 transition-all outline-none text-sm
        ${error ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-gray-100 bg-gray-50 focus:border-pink-200 focus:bg-white'}
      `}
      {...props}
    />
    {error && <span className="text-[10px] text-red-500 ml-1 font-medium">{error}</span>}
    {hint && !error && <span className="text-[10px] text-gray-400 ml-1">{hint}</span>}
  </div>
);

export const Modal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-white rounded-3xl w-full ${sizes[size]} overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl`}>
        <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-[#FFF9F0]/30">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">&times;</button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 bg-gray-50/50 flex justify-end gap-3 border-t border-gray-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const Badge: React.FC<{ color?: string; children: React.ReactNode }> = ({ color = 'blue', children }) => {
  const colors: Record<string, string> = {
    green: "bg-green-50 text-green-600 border border-green-100",
    blue: "bg-blue-50 text-blue-600 border border-blue-100",
    red: "bg-red-50 text-red-600 border border-red-100",
    yellow: "bg-yellow-50 text-yellow-600 border border-yellow-100",
    pink: "bg-pink-50 text-pink-600 border border-pink-100",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors[color]}`}>
      {children}
    </span>
  );
};

export const Progress: React.FC<{ value: number; label?: string }> = ({ value, label }) => (
  <div className="w-full space-y-1">
    <div className="flex justify-between text-[10px] font-bold text-gray-500">
      <span>{label || '处理进度'}</span>
      <span>{Math.round(value)}%</span>
    </div>
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div 
        className="h-full bg-[#FFB7C5] transition-all duration-300 ease-out" 
        style={{ width: `${value}%` }} 
      />
    </div>
  </div>
);
