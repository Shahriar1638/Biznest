const SecondaryButton = ({ 
  children, 
  size = 'medium', 
  onClick, 
  disabled = false, 
  type = 'button',
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm min-h-8',
    medium: 'px-6 py-2 text-sm min-h-10',
    large: 'px-8 py-3 text-base min-h-12'
  };

  const baseClasses = 'btn-biznest-secondary inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2';
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'hover:bg-gray-50 hover:border-gray-400';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
