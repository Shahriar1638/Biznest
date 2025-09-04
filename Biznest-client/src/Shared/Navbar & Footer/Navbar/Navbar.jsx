import { Link } from 'react-router-dom';
import useAuth from '../../../Hooks/useAuth';
import { PrimaryButton, SecondaryButton } from '../../../Components/Buttons';
import MobileNavbar from './MobileNavbar';
import logo from '../../../assets/logo.png';

const Navbar = () => {
    const { user, logOut } = useAuth();

    // Function to get home route based on user type
    const getHomeRoute = () => {
        if (!user) return '/';
        
        switch (user.role?.type) {
            case 'customer':
                return '/customer-home';
            case 'seller':
                return '/seller-home';
            default:
                return '/';
        }
    };

    const handleLogout = async () => {
        try {
            await logOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 relative">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center space-x-3">
                        <Link to={getHomeRoute()} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                            <img 
                                src={logo} 
                                alt="BizNest Logo" 
                                className="h-8 w-8 object-contain"
                            />
                            <span className="text-2xl font-bold text-gray-900">
                                Biz<span className="text-amber-600">Nest</span>
                            </span>
                        </Link>
                    </div>
                    
                    {/* Desktop Navigation Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link 
                            to={getHomeRoute()} 
                            className="text-gray-700 hover:text-amber-600 font-medium transition-colors"
                        >
                            Home
                        </Link>
                        
                        <Link 
                            to="/allproducts" 
                            className="text-gray-700 hover:text-amber-600 font-medium transition-colors"
                        >
                            All Products
                        </Link>
                        
                        {/* Customer-specific navigation */}
                        {user && user.role?.type === 'customer' && (
                            <Link 
                                to="/cart" 
                                className="text-gray-700 hover:text-amber-600 font-medium transition-colors"
                            >
                                Cart
                            </Link>
                        )}
                        
                        {/* Seller-specific navigation */}
                        {user && user.role?.type === 'seller' && (
                            <Link 
                                to="/dashboard" 
                                className="text-gray-700 hover:text-amber-600 font-medium transition-colors"
                            >
                                Dashboard
                            </Link>
                        )}
                        
                        <Link 
                            to="/help-nd-support" 
                            className="text-gray-700 hover:text-amber-600 font-medium transition-colors"
                        >
                            Help & Support
                        </Link>
                        
                        {/* Profile - Only for logged in users */}
                        {user && (
                            <Link 
                                to="/profile" 
                                className="text-gray-700 hover:text-amber-600 font-medium transition-colors"
                            >
                                Profile
                            </Link>
                        )}
                    </div>
                    
                    {/* Desktop Login/Logout section */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <span className="text-sm font-medium text-gray-900 block">
                                        {user.username}
                                    </span>
                                    <span className="text-xs text-gray-500 capitalize">
                                        {user.role?.type}
                                    </span>
                                </div>
                                <SecondaryButton 
                                    size="small" 
                                    onClick={handleLogout}
                                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                                >
                                    Logout
                                </SecondaryButton>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login">
                                    <SecondaryButton size="small">
                                        Login
                                    </SecondaryButton>
                                </Link>
                                <Link to="/signup">
                                    <PrimaryButton size="small">
                                        Sign Up
                                    </PrimaryButton>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Navigation */}
                    <MobileNavbar 
                        user={user}
                        getHomeRoute={getHomeRoute}
                        handleLogout={handleLogout}
                    />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;