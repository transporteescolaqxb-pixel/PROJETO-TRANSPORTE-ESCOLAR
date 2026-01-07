import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  error?: string;
}

const Select: React.FC<SelectProps> = ({ label, options, error, value, ...props }) => {
  return (
    <div className="w-full mb-4">
      <label className="block text-sm font-semibold text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          className={`w-full px-4 py-2 bg-white border rounded-lg appearance-none focus:outline-none focus:ring-2 transition-all duration-200 ${
            error 
              ? 'border-red-500 focus:ring-red-200' 
              : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
          } ${value === '' ? 'text-slate-400' : 'text-slate-900'}`}
          {...props}
        >
          <option value="" disabled>Selecione uma opção</option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="text-slate-900">
              {opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Select;