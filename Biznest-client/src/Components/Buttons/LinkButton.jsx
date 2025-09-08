const LinkButton = ({ 
  children, 
  to,
  size = 'medium', 
  variant = 'primary',
  disabled = false,
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm min-h-8',
    medium: 'px-6 py-2 text-sm min-h-10',
    large: 'px-8 py-3 text-base min-h-12'
  };

  const variantClasses = {
    primary: 'btn-biznest-primary focus:ring-amber-500',
    secondary: 'btn-biznest-secondary focus:ring-gray-300',
    outline: 'btn-biznest-outline focus:ring-amber-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500'
  };

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 no-underline';
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed pointer-events-none' 
    : variant === 'primary' || variant === 'danger' 
      ? 'hover:-translate-y-0.5 hover:shadow-md cursor-pointer'
      : 'cursor-pointer';

  // If disabled, render as span instead of Link
  if (disabled) {
    return (
      <span
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }

  return (
    <a
      href={to}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
};

export default LinkButton;
