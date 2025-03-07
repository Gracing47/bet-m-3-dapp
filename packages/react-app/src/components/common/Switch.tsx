import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
  id = `switch-${Math.random().toString(36).substr(2, 9)}`,
}: SwitchProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative inline-block w-10 mr-2 align-middle select-none">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`
            block 
            h-6 
            w-10 
            rounded-full 
            transition duration-200 ease-in
            ${checked ? 'bg-primary' : 'bg-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        ></div>
        <div
          className={`
            dot 
            absolute 
            left-1 
            top-1 
            h-4 
            w-4 
            rounded-full 
            transition duration-200 ease-in
            bg-white
            transform
            ${checked ? 'translate-x-4' : 'translate-x-0'}
          `}
        ></div>
      </div>
      {label && (
        <label
          htmlFor={id}
          className={`text-sm font-medium ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer'}`}
        >
          {label}
        </label>
      )}
    </div>
  );
}

export default Switch; 