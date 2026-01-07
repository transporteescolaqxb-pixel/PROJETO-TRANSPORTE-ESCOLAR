import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full mb-4">
      <label className="block text-sm font-semibold text-slate-700 mb-1">
        {label}
      </label>
      <input
        className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
          error 
            ? 'border-red-500 focus:ring-red-200' 
            : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Input;