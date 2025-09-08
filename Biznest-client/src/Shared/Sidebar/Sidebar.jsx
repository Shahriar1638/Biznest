import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../Hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logOut } = useAuth();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Check user role
    const isAdmin = user?.role?.type === 'admin';
    const isSeller = user?.role?.type === 'seller';

    // Admin menu items
    const adminMenuItems = [
        {
            title: 'Product Management',
            icon: 'fas fa-box',
            path: '/dashboard/admin/products',
            children: []
        },
        {
            title: 'Register Admin',
            icon: 'fas fa-user-plus',
            path: '/dashboard/admin/register',
            children: []
        }
    ]

    // Seller menu items
    const sellerMenuItems = [
        {
            title: 'My Products',
            icon: 'fas fa-box',
            path: '/dashboard/seller/products',
            children: []
        },
        {
            title: 'Add Product',
            icon: 'fas fa-plus',
            path: '/dashboard/seller/add-product',
            children: []
        }
    ];

    // Get menu items based on user role
    const menuItems = isAdmin ? adminMenuItems : isSeller ? sellerMenuItems : [];

    // Check if path is active
    const isActivePath = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await logOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`
                fixed left-0 top-0 h-screen bg-white shadow-lg z-50 transition-all duration-300 
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                ${isCollapsed ? 'w-16' : 'w-64'} 
                lg:translate-x-0 lg:static lg:inset-auto lg:h-screen
                flex flex-col
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    {!isCollapsed && (
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">BN</span>
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900">BizNest</h2>
                                <p className="text-xs text-gray-500 capitalize">
                                    {user?.role?.type} Panel
                                </p>
                            </div>
                        </div>
                    )}
                    
                    {/* Toggle Collapse Button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hidden lg:block"
                    >
                        <i className={`fas ${isCollapsed ? 'fa-expand-arrows-alt' : 'fa-compress-arrows-alt'}`}></i>
                    </button>

                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 lg:hidden"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* User Info */}
                {!isCollapsed && (
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                <i className="fas fa-user text-amber-600"></i>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                    {user?.username || 'User'}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                        {menuItems.map((item, index) => (
                            <MenuItem 
                                key={index}
                                item={item}
                                isCollapsed={isCollapsed}
                                isActive={isActivePath(item.path)}
                                onItemClick={onClose}
                            />
                        ))}
                    </div>
                </nav>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4">
                    {!isCollapsed ? (
                        <div className="space-y-2">
                            {/* Home Page Button based on user type */}
                            {(isAdmin || isSeller) && (
                                <Link 
                                    to={isAdmin ? "/admin-home" : "/seller-home"}
                                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                                    onClick={onClose}
                                >
                                    <i className="fas fa-home w-5"></i>
                                    <span>{isAdmin ? "Admin Home" : "Seller Home"}</span>
                                </Link>
                            )}
                            <Link 
                                to="/profile"
                                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={onClose}
                            >
                                <i className="fas fa-user-cog w-5"></i>
                                <span>Profile Settings</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <i className="fas fa-sign-out-alt w-5"></i>
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Home Page Button for collapsed sidebar */}
                            {(isAdmin || isSeller) && (
                                <Link
                                    to={isAdmin ? "/admin-home" : "/seller-home"}
                                    className="w-full p-2 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors flex justify-center"
                                    title={isAdmin ? "Admin Home" : "Seller Home"}
                                    onClick={onClose}
                                >
                                    <i className="fas fa-home"></i>
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="w-full p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                title="Logout"
                            >
                                <i className="fas fa-sign-out-alt"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// MenuItem Component for handling dropdowns
const MenuItem = ({ item, isCollapsed, isActive, onItemClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const location = useLocation();

    const hasChildren = item.children && item.children.length > 0;
    const isChildActive = hasChildren && item.children.some(child => 
        location.pathname === child.path || location.pathname.startsWith(child.path + '/')
    );

    const handleClick = () => {
        if (hasChildren && !isCollapsed) {
            setIsExpanded(!isExpanded);
        } else if (!hasChildren) {
            onItemClick?.();
        }
    };

    return (
        <div>
            {/* Main Menu Item */}
            {hasChildren && !isCollapsed ? (
                <button
                    onClick={handleClick}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        isActive || isChildActive
                            ? 'bg-amber-100 text-amber-700'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <div className="flex items-center space-x-3">
                        <i className={`${item.icon} w-5`}></i>
                        <span>{item.title}</span>
                    </div>
                    <i className={`fas fa-chevron-right transform transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                    }`}></i>
                </button>
            ) : (
                <Link
                    to={item.path}
                    onClick={onItemClick}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                            ? 'bg-amber-100 text-amber-700'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    title={isCollapsed ? item.title : ''}
                >
                    <i className={`${item.icon} w-5`}></i>
                    {!isCollapsed && <span>{item.title}</span>}
                </Link>
            )}

            {/* Submenu Items */}
            {hasChildren && !isCollapsed && isExpanded && (
                <div className="ml-6 mt-2 space-y-1">
                    {item.children.map((child, index) => (
                        <Link
                            key={index}
                            to={child.path}
                            onClick={onItemClick}
                            className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                                location.pathname === child.path
                                    ? 'bg-amber-50 text-amber-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {child.title}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Sidebar;
