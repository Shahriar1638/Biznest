import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../../Hooks/useAxiosSecure';
import useAuth from '../../../../Hooks/useAuth';
import Swal from 'sweetalert2';

const ALLProductsAdmin = () => {
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const { data: productsData = null, isLoading, error, refetch } = useQuery({
        queryKey: ['adminProducts', selectedFilter],
        queryFn: async () => {
            let response;
            if (selectedFilter === 'all') {
                response = await axiosSecure.get('/products/allproducts');
                return { products: response.data, count: response.data.length };
            } else {
                response = await axiosSecure.get(`/products/filter/${selectedFilter}`);
                return response.data;
            }
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
    });

    const products = productsData?.products || [];
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.productId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.selleremail?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...new Set(products.map(product => product.category).filter(Boolean))];


    const handleStatusChange = async (productId, newStatus) => {
        try {
            if (!user || user.role?.type !== 'admin') {
                Swal.fire({
                    icon: 'error',
                    title: 'Unauthorized',
                    text: 'You must be an admin to perform this action.',
                    confirmButtonColor: '#f59e0b'
                });
                return;
            }

            const result = await Swal.fire({
                title: 'Are you sure?',
                text: `Change product status to ${newStatus}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#f59e0b',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, change it!'
            });

            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Updating...',
                    text: 'Please wait while we update the product status.',
                    icon: 'info',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const response = await axiosSecure.put('/admin/products/status', {
                    productId: productId,
                    status: newStatus,
                    adminEmail: user.email
                });

                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Updated!',
                        text: response.data.message,
                        confirmButtonColor: '#f59e0b'
                    });
                    
                    refetch();
                } else {
                    throw new Error(response.data.message || 'Failed to update product status');
                }
            }
        } catch (error) {
            console.error('Error updating product status:', error);
            
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update product status';
            
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: errorMessage,
                confirmButtonColor: '#f59e0b'
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading products...</p>
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
                    <p className="text-gray-600 mb-4">Failed to load products. Please try again.</p>
                    <button 
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
                    <p className="text-gray-600">Manage and review all products in the system</p>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products, ID, or seller..."
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

                        {/* Filters */}
                        <div className="flex items-center gap-4">
                            {/* Status Filter */}
                            <select
                                value={selectedFilter}
                                onChange={(e) => setSelectedFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="released">Released</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </select>

                            {/* Category Filter */}
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
                                className="p-2 text-gray-600 hover:text-amber-600 transition-colors cursor-button"
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
                            Filter: {selectedFilter === 'all' ? 'All Status' : selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
                        </span>
                    </div>
                </div>

                {/* Products Table */}
                {filteredProducts.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                                            Seller
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
                                            Publish Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sales
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
                                                                {product.quantity_description?.length || 0} variants
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Product ID */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                                                    {product.productId}
                                                </td>

                                                {/* Seller */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {product.selleremail}
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
                                                        product.product_status === 'released' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : product.product_status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {product.product_status || 'pending'}
                                                    </span>
                                                </td>

                                                {/* Publish Date */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {product.product_publishdate}
                                                </td>

                                                {/* Sales */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{product.sell_count?.length || 0} sales</span>
                                                        <span className="text-xs text-gray-500">
                                                            Avg: {product.rating?.length > 0 
                                                                ? (product.rating.reduce((sum, r) => sum + r.rate, 0) / product.rating.length).toFixed(1) 
                                                                : 'N/A'} ⭐
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        {product.product_status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleStatusChange(product.productId, 'released')}
                                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(product.productId, 'rejected')}
                                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {product.product_status === 'rejected' && (
                                                            <button
                                                                onClick={() => handleStatusChange(product.productId, 'released')}
                                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                        {product.product_status === 'released' && (
                                                            <button
                                                                onClick={() => handleStatusChange(product.productId, 'rejected')}
                                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                            >
                                                                Reject
                                                            </button>
                                                        )}
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
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm || selectedCategory !== 'all' || selectedFilter !== 'all' ? 'No products found' : 'No products yet'}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm || selectedCategory !== 'all' || selectedFilter !== 'all'
                                ? 'Try adjusting your search or filter criteria'
                                : 'Products will appear here once sellers start adding them'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ALLProductsAdmin;