import { Link } from 'react-router-dom';
import useAuth from '../../Hooks/useAuth';
import { PrimaryButton, SecondaryButton } from '../../Components/Buttons';

const AdminHome = () => {
    const { user } = useAuth();

    const adminStats = {
        totalUsers: 5,
        totalSellers: 2,
        totalCustomers: 2,
        totalProducts: 41,
        pendingProducts: 8,
        approvedProducts: 32,
        rejectedProducts: 1,
        totalRevenue: 21251.25,
        salary: user?.role?.details?.salary || 75000
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Welcome Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Welcome to Admin Dashboard, {user?.username || 'Admin'}
                    </h1>
                    <p className="text-lg text-gray-600">
                        Manage users, products, and oversee the entire BizNest platform
                    </p>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {/* User Management */}
                    <div className="card-biznest p-6 text-center hover:shadow-lg transition-shadow flex flex-col h-full">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">User Management</h3>
                        <p className="text-gray-600 mb-6 text-sm flex-grow">Manage customers, sellers, and admin accounts</p>
                        <PrimaryButton className="w-full">
                            Manage Users
                        </PrimaryButton>
                    </div>

                    {/* Product Management */}
                    <div className="card-biznest p-6 text-center hover:shadow-lg transition-shadow flex flex-col h-full">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Control</h3>
                        <p className="text-gray-600 mb-6 text-sm flex-grow">Approve, reject, and manage all platform products</p>
                        <PrimaryButton className="w-full">
                            View Products
                        </PrimaryButton>
                    </div>

                    {/* Order Management */}
                    <div className="card-biznest p-6 text-center hover:shadow-lg transition-shadow flex flex-col h-full">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Oversight</h3>
                        <p className="text-gray-600 mb-6 text-sm flex-grow">Monitor all platform orders and transactions</p>
                        <PrimaryButton className="w-full">
                            View Orders
                        </PrimaryButton>
                    </div>

                    {/* Analytics */}
                    <div className="card-biznest p-6 text-center hover:shadow-lg transition-shadow flex flex-col h-full">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Platform Analytics</h3>
                        <p className="text-gray-600 mb-6 text-sm flex-grow">View comprehensive platform statistics</p>
                        <PrimaryButton className="w-full">
                            View Analytics
                        </PrimaryButton>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
                    <div className="card-biznest p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">{adminStats.totalUsers}</div>
                        <div className="text-gray-600 text-sm">Total Users</div>
                    </div>
                    <div className="card-biznest p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">{adminStats.totalSellers}</div>
                        <div className="text-gray-600 text-sm">Sellers</div>
                    </div>
                    <div className="card-biznest p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">{adminStats.totalCustomers}</div>
                        <div className="text-gray-600 text-sm">Customers</div>
                    </div>
                    <div className="card-biznest p-4 text-center">
                        <div className="text-2xl font-bold text-amber-600 mb-1">{adminStats.totalProducts}</div>
                        <div className="text-gray-600 text-sm">Total Products</div>
                    </div>
                    <div className="card-biznest p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600 mb-1">{adminStats.pendingProducts}</div>
                        <div className="text-gray-600 text-sm">Pending</div>
                    </div>
                    <div className="card-biznest p-4 text-center">
                        <div className="text-2xl font-bold text-red-600 mb-1">{adminStats.rejectedProducts}</div>
                        <div className="text-gray-600 text-sm">Rejected</div>
                    </div>
                </div>

                {/* Revenue and Admin Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="card-biznest p-6 text-center bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            ৳{adminStats.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-gray-600">Platform Revenue</div>
                        <div className="text-sm text-gray-500 mt-1">Combined seller earnings</div>
                    </div>
                    <div className="card-biznest p-6 text-center bg-gradient-to-r from-blue-50 to-cyan-50">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            ৳{adminStats.salary.toLocaleString()}
                        </div>
                        <div className="text-gray-600">Your Salary</div>
                        <div className="text-sm text-gray-500 mt-1">Annual compensation</div>
                    </div>
                    <div className="card-biznest p-6 text-center bg-gradient-to-r from-purple-50 to-pink-50">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                            {user?.role?.details?.adminID || 'ADM001'}
                        </div>
                        <div className="text-gray-600">Admin ID</div>
                        <div className="text-sm text-gray-500 mt-1">Your unique identifier</div>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Pending Approvals */}
                    <div className="card-biznest p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Pending Approvals</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Product Approvals</p>
                                    <p className="text-sm text-gray-600">{adminStats.pendingProducts} products waiting</p>
                                </div>
                                <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm">
                                    Pending
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Seller Applications</p>
                                    <p className="text-sm text-gray-600">Review new seller requests</p>
                                </div>
                                <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
                                    Review
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Users */}
                    <div className="card-biznest p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Users</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-medium text-sm">JS</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">Jane Smith</p>
                                    <p className="text-sm text-gray-600">Customer • Banned</p>
                                </div>
                                <span className="px-2 py-1 bg-red-200 text-red-800 rounded-full text-xs">
                                    Banned
                                </span>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 font-medium text-sm">S2</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">Seller Two</p>
                                    <p className="text-sm text-gray-600">Seller • Active</p>
                                </div>
                                <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Access Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* System Controls */}
                    <div className="card-biznest p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">System Controls</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                                <div className="font-medium text-gray-900 mb-1">Platform Settings</div>
                                <div className="text-sm text-gray-600 mb-3">Configure platform-wide settings</div>
                                <PrimaryButton className="w-full">
                                    Open Settings
                                </PrimaryButton>
                            </div>
                            <div className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                                <div className="font-medium text-gray-900 mb-1">Backup & Maintenance</div>
                                <div className="text-sm text-gray-600 mb-3">System backup and maintenance tools</div>
                                <PrimaryButton className="w-full">
                                    Manage System
                                </PrimaryButton>
                            </div>
                            <div className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                                <div className="font-medium text-gray-900 mb-1">Security Logs</div>
                                <div className="text-sm text-gray-600 mb-3">Review security and access logs</div>
                                <PrimaryButton className="w-full">
                                    View Logs
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="card-biznest p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Access</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
                                <div className="font-medium text-gray-900 mb-1">Full Dashboard</div>
                                <div className="text-sm text-gray-600 mb-3">Access complete admin dashboard</div>
                                <Link to="/dashboard" className="block">
                                    <PrimaryButton className="w-full">
                                        Go to Dashboard
                                    </PrimaryButton>
                                </Link>
                            </div>
                            <div className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                <div className="font-medium text-gray-900 mb-1">Browse Products</div>
                                <div className="text-sm text-gray-600 mb-3">View all platform products</div>
                                <Link to="/allproducts" className="block">
                                    <PrimaryButton className="w-full">
                                        View Products
                                    </PrimaryButton>
                                </Link>
                            </div>
                            <div className="p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                                <div className="font-medium text-gray-900 mb-1">Support Center</div>
                                <div className="text-sm text-gray-600 mb-3">Help and documentation</div>
                                <Link to="/help-nd-support" className="block">
                                    <PrimaryButton className="w-full">
                                        Get Support
                                    </PrimaryButton>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admin Notice */}
                <div className="mt-12 card-biznest p-8 text-center bg-gradient-to-r from-blue-50 to-indigo-100">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">Platform Administration</h3>
                    <p className="text-gray-600 mb-6">
                        You have full administrative control over the BizNest platform. Monitor users, manage content, and ensure smooth operations.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/dashboard">
                            <PrimaryButton>
                                Go to Dashboard
                            </PrimaryButton>
                        </Link>
                        <PrimaryButton>
                            View Reports
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;