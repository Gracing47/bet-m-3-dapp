import React, { ReactNode } from 'react';

type BaseButtonProps = {
  onClick: () => void;
  widthFull?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
};

// PrimaryButton Komponente
export function PrimaryButton({
  title,
  onClick,
  widthFull = false,
  disabled,
  loading,
  className = "",
  children,
  type = 'button',
}: BaseButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${widthFull ? "w-full" : "px-4"} 
        ${className} 
        font-bold 
        bg-primary 
        hover:bg-primary-light 
        focus:ring-2 
        focus:ring-primary-dark 
        focus:outline-none 
        rounded-2xl 
        text-white 
        py-3 
        flex 
        justify-center 
        items-center
        transition duration-200
        ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {loading ? "Loading..." : children || title}
    </button>
  );
}

// SecondaryButton Komponente
export function SecondaryButton({
  title,
  onClick,
  widthFull = false,
  disabled,
  loading,
  className = "",
  children,
  type = 'button',
}: BaseButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${widthFull ? "w-full" : "px-4"} 
        ${className} 
        font-bold 
        bg-secondary 
        hover:bg-secondary-light 
        focus:ring-2 
        focus:ring-secondary-dark 
        focus:outline-none 
        rounded-2xl 
        text-gray-800 
        py-3 
        flex 
        justify-center 
        items-center
        transition duration-200
        ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {loading ? "Loading..." : children || title}
    </button>
  );
}

// IconButton Komponente
type IconButtonProps = BaseButtonProps & {
  icon: ReactNode;
  label?: string;
};

export function IconButton({
  onClick,
  disabled,
  loading,
  className = "",
  icon,
  label,
  type = 'button',
}: IconButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={label}
      className={`
        ${className} 
        p-2
        rounded-full
        bg-gray-100
        hover:bg-gray-200
        focus:ring-2
        focus:ring-primary
        focus:outline-none
        flex
        justify-center
        items-center
        transition duration-200
        ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {loading ? (
        <span className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></span>
      ) : (
        icon
      )}
    </button>
  );
}

// Für Abwärtskompatibilität
export default PrimaryButton;
