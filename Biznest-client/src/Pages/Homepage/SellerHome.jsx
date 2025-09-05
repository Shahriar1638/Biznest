import { Link } from 'react-router-dom';
import { PrimaryButton, SecondaryButton } from '../../Components/Buttons';

const SellerHome = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Welcome Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Your Seller Dashboard</h1>
                    <p className="text-lg text-gray-600">Manage your products, orders, and grow your business with BizNest</p>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {/* Add Product */}
                    <div className="card-biznest p-6 text-center hover:shadow-lg transition-shadow">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Add New Product</h3>
                        <p className="text-gray-600 mb-4">List new products to expand your inventory</p>
                        <PrimaryButton className="w-full">
                            Add Product
                        </PrimaryButton>
                    </div>

                    {/* Manage Products */}
                    <div className="card-biznest p-6 text-center hover:shadow-lg transition-shadow">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Products</h3>
                        <p className="text-gray-600 mb-4">Edit, update, or remove your existing products</p>
                        <SecondaryButton className="w-full">
                            View Products
                        </SecondaryButton>
                    </div>

                    {/* Orders */}
                    <div className="card-biznest p-6 text-center hover:shadow-lg transition-shadow">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">View Orders</h3>
                        <p className="text-gray-600 mb-4">Track and manage your customer orders</p>
                        <SecondaryButton className="w-full">
                            View Orders
                        </SecondaryButton>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="card-biznest p-6 text-center">
                        <div className="text-3xl font-bold text-amber-600 mb-2">0</div>
                        <div className="text-gray-600">Total Products</div>
                    </div>
                    <div className="card-biznest p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
                        <div className="text-gray-600">Total Orders</div>
                    </div>
                    <div className="card-biznest p-6 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">৳0</div>
                        <div className="text-gray-600">Total Revenue</div>
                    </div>
                    <div className="card-biznest p-6 text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
                        <div className="text-gray-600">Pending Orders</div>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Orders */}
                    <div className="card-biznest p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h3>
                        <div className="text-center py-8 text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>No recent orders</p>
                        </div>
                    </div>

                    {/* Recent Products */}
                    <div className="card-biznest p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Products</h3>
                        <div className="text-center py-8 text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <p>No products added yet</p>
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                <div className="mt-12 card-biznest p-8 text-center bg-gradient-to-r from-amber-50 to-amber-100">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">Need Help Getting Started?</h3>
                    <p className="text-gray-600 mb-6">Learn how to set up your store, add products, and manage orders effectively</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/help-nd-support">
                            <SecondaryButton>
                                Visit Help Center
                            </SecondaryButton>
                        </Link>
                        <PrimaryButton>
                            Start Selling
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerHome;