import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import useAuth from '../../../../Hooks/useAuth';
import useAxiosSecure from '../../../../Hooks/useAxiosSecure';
import { PrimaryButton, SecondaryButton, DangerButton } from '../../../../Components/Buttons';

const MyProducts = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const { 
        data: productsData = null, 
        isLoading, 
        error, 
        refetch 
    } = useQuery({
        queryKey: ['sellerProducts', user?.email],
        queryFn: async () => {
            if (!user?.email) return { products: [] };
            const response = await axiosSecure.get(`/seller/myproducts/${user.email}`);
            return response.data;
        },
        enabled: !!user?.email,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
    });

    const products = productsData?.products || [];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.productId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...new Set(products.map(product => product.category).filter(Boolean))];

    const handleAddStock = (productId) => {
        console.log('Add stock for product:', productId);
    };

    const handleEditProduct = (productId) => {
        console.log('Edit product:', productId);
    };

    const handleRemoveProduct = (productId) => {
        console.log('Remove product:', productId);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading Products</h2>
                    <p className="text-gray-600 mb-4">Failed to load your products. Please try again.</p>
                    <SecondaryButton onClick={() => refetch()}>
                        Try Again
                    </SecondaryButton>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Products</h1>
                    <p className="text-gray-600">Manage your product inventory and details</p>
                </div>

                {/* Filters and Search */}
                <div className="card-biznest p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black placeholder-gray-500"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="flex items-center gap-4">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black bg-white"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category === 'all' ? 'All Categories' : category}
                                    </option>
                                ))}
                            </select>

                            {/* Refresh Button */}
                            <button
                                onClick={() => refetch()}
                                className="p-2 text-gray-600 hover:text-amber-600 transition-colors"
                                title="Refresh products"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                        <span>
                            Showing {filteredProducts.length} of {products.length} products
                        </span>
                        <span>
                            Total Products: {products.length}
                        </span>
                    </div>
                </div>

                {/* Products Table */}
                {filteredProducts.length > 0 ? (
                    <div className="card-biznest overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                {/* Table Header */}
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price Range
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock Units
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                {/* Table Body */}
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProducts.map((product) => {
                                        // Calculate price range from quantity_description
                                        const prices = product.quantity_description?.map(unit => unit.unit_price) || [];
                                        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                                        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
                                        const priceRange = minPrice === maxPrice ? `৳${minPrice}` : `৳${minPrice} - ৳${maxPrice}`;

                                        return (
                                            <tr key={product.productId || product._id} className="hover:bg-gray-50">
                                                {/* Product Info */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-12 w-12 flex-shrink-0">
                                                            {product.product_imgurl ? (
                                                                <img 
                                                                    className="h-12 w-12 rounded-lg object-cover" 
                                                                    src={product.product_imgurl} 
                                                                    alt={product.product_name}
                                                                />
                                                            ) : (
                                                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                                                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {product.product_name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {product.product_description?.substring(0, 50)}...
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Product ID */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {product.productId}
                                                </td>

                                                {/* Category */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {product.category}
                                                </td>

                                                {/* Price Range */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                    {priceRange}
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        product.status === 'approved' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : product.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {product.status || 'pending'}
                                                    </span>
                                                </td>

                                                {/* Stock Units */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {product.quantity_description?.length || 0} units
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleAddStock(product.productId)}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        >
                                                            Add Stock
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditProduct(product.productId)}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveProduct(product.productId)}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    // Empty State
                    <div className="card-biznest p-12 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm || selectedCategory !== 'all' ? 'No products found' : 'No products yet'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || selectedCategory !== 'all' 
                                ? 'Try adjusting your search or filter criteria'
                                : 'Start by adding your first product to begin selling'
                            }
                        </p>
                        {(!searchTerm && selectedCategory === 'all') && (
                            <Link to="/dashboard/seller/add-product">
                                <PrimaryButton>
                                    Add Your First Product
                                </PrimaryButton>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyProducts;
