import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryButton, SecondaryButton } from '../../../Components/Buttons';

const MobileNavbar = ({ user, getHomeRoute, handleLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Mobile menu button */}
            <div className="md:hidden">
                <button 
                    onClick={toggleMobileMenu}
                    className="text-gray-700 hover:text-amber-600 p-2 transition-colors"
                    aria-label="Toggle mobile menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 md:hidden bg-white border-t border-gray-200 shadow-lg z-50">
                    <div className="px-4 py-3 space-y-3">
                        <Link 
                            to={getHomeRoute()} 
                            className="block text-gray-700 hover:text-amber-600 font-medium transition-colors py-2"
                            onClick={closeMobileMenu}
                        >
                            Home
                        </Link>
                        
                        <Link 
                            to="/allproducts" 
                            className="block text-gray-700 hover:text-amber-600 font-medium transition-colors py-2"
                            onClick={closeMobileMenu}
                        >
                            All Products
                        </Link>
                        
                        {/* Customer-specific navigation */}
                        {user && user.role?.type === 'customer' && (
                            <Link 
                                to="/cart" 
                                className="block text-gray-700 hover:text-amber-600 font-medium transition-colors py-2"
                                onClick={closeMobileMenu}
                            >
                                Cart
                            </Link>
                        )}
                        
                        {/* Seller-specific navigation */}
                        {user && user.role?.type === 'seller' && (
                            <Link 
                                to="/dashboard" 
                                className="block text-gray-700 hover:text-amber-600 font-medium transition-colors py-2"
                                onClick={closeMobileMenu}
                            >
                                Dashboard
                            </Link>
                        )}
                        
                        <Link 
                            to="/help-nd-support" 
                            className="block text-gray-700 hover:text-amber-600 font-medium transition-colors py-2"
                            onClick={closeMobileMenu}
                        >
                            Help & Support
                        </Link>
                        
                        {/* Profile - Only for logged in users */}
                        {user && (
                            <Link 
                                to="/profile" 
                                className="block text-gray-700 hover:text-amber-600 font-medium transition-colors py-2"
                                onClick={closeMobileMenu}
                            >
                                Profile
                            </Link>
                        )}

                        {/* Mobile Login/Logout section */}
                        <div className="pt-3 border-t border-gray-200">
                            {user ? (
                                <div className="space-y-3">
                                    <div className="text-sm">
                                        <span className="font-medium text-gray-900 block">
                                            {user.username}
                                        </span>
                                        <span className="text-xs text-gray-500 capitalize">
                                            {user.role?.type}
                                        </span>
                                    </div>
                                    <SecondaryButton 
                                        size="small" 
                                        onClick={() => {
                                            handleLogout();
                                            closeMobileMenu();
                                        }}
                                        className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                                    >
                                        Logout
                                    </SecondaryButton>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Link to="/login" onClick={closeMobileMenu}>
                                        <SecondaryButton size="small" className="w-full">
                                            Login
                                        </SecondaryButton>
                                    </Link>
                                    <Link to="/signup" onClick={closeMobileMenu}>
                                        <PrimaryButton size="small" className="w-full">
                                            Sign Up
                                        </PrimaryButton>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MobileNavbar;
