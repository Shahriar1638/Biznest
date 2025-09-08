const IconButton = ({ 
  children, 
  icon,
  size = 'medium', 
  onClick, 
  disabled = false, 
  type = 'button',
  variant = 'primary',
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm min-h-8 gap-1.5',
    medium: 'px-6 py-2 text-sm min-h-10 gap-2',
    large: 'px-8 py-3 text-base min-h-12 gap-2.5'
  };

  const variantClasses = {
    primary: 'btn-biznest-primary focus:ring-amber-500',
    secondary: 'btn-biznest-secondary focus:ring-gray-300',
    outline: 'btn-biznest-outline focus:ring-amber-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500'
  };

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : variant === 'primary' || variant === 'danger' 
      ? 'hover:-translate-y-0.5 hover:shadow-md cursor-pointer'
      : 'cursor-pointer';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default IconButton;
