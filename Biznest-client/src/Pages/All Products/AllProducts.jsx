import { useState } from 'react';
import { useProducts } from '../../Hooks/useProducts';
import { CustomerCard } from '../../Components/Cards';
import { PrimaryButton, OutlineButton } from '../../Components/Buttons';

const AllProducts = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // TanStack Query for fetching products using custom hook
    const {
        data: products = [],
        isLoading: loading,
        error,
        refetch
    } = useProducts(selectedCategory);

    // Categories list
    const categories = [
        { id: 'all', name: 'All Products', icon: '🛍️' },
        { id: 'Groceries & Pantry', name: 'Groceries & Pantry', icon: '🛒' },
        { id: 'Kids & Baby', name: 'Kids & Baby', icon: '👶' },
        { id: 'Electronics & Gadgets', name: 'Electronics & Gadgets', icon: '📱' },
        { id: 'Home & Kitchen Appliances', name: 'Home & Kitchen Appliances', icon: '🏠' },
        { id: 'Health & Personal Care', name: 'Health & Personal Care', icon: '💊' },
        { id: 'Beauty & Lifestyle', name: 'Beauty & Lifestyle', icon: '💄' },
        { id: 'Fashion & Cosmetics', name: 'Fashion & Cosmetics', icon: '👗' },
        { id: 'Sports & Fitness', name: 'Sports & Fitness', icon: '⚽' },
        { id: 'Books, Stationery & Hobbies', name: 'Books, Stationery & Hobbies', icon: '📚' },
        { id: 'Home & Garden', name: 'Home & Garden', icon: '🌱' }
    ];

    // Handle category selection - this will trigger a new query
    const handleCategorySelect = (categoryId) => {
        setSelectedCategory(categoryId);
        setSidebarOpen(false); // Close sidebar on mobile after selection
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <section className="bg-gradient-to-r from-amber-500 to-orange-500 py-12 px-4">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                All Products
                            </h1>
                            <p className="text-amber-100">
                                Discover amazing products from local sellers in your community
                            </p>
                        </div>
                        
                        {/* Mobile Category Toggle */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:hidden bg-white text-amber-600 px-4 py-2 rounded-lg font-medium"
                        >
                            <i className="fas fa-filter mr-2"></i>
                            Categories
                        </button>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar - Categories */}
                    <div className={`md:w-64 ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
                        <div className="card-biznest p-6 sticky top-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <i className="fas fa-filter mr-2 text-amber-600"></i>
                                Categories
                            </h3>
                            
                            <div className="space-y-2">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategorySelect(category.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center ${
                                            selectedCategory === category.id
                                                ? 'bg-amber-100 text-amber-700 font-medium'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <span className="mr-3 text-lg">{category.icon}</span>
                                        <span className="text-sm">{category.name}</span>
                                    </button>
                                ))}
                            </div>
                            
                            {/* Category Info */}
                            <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                                <h4 className="font-semibold text-amber-800 mb-2">
                                    🏪 Support Local Business
                                </h4>
                                <p className="text-sm text-amber-700">
                                    Every purchase helps support local entrepreneurs in your community.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Results Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {selectedCategory === 'all' ? 'All Products' : selectedCategory}
                                </h2>
                                <p className="text-gray-600">
                                    {loading ? 'Loading products...' : `${products.length} products found`}
                                </p>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-3">
                                {/* Refresh Button */}
                                <button
                                    onClick={() => refetch()}
                                    disabled={loading}
                                    className="p-2 text-gray-600 hover:text-amber-600 transition-colors disabled:opacity-50"
                                    title="Refresh products"
                                >
                                    <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`}></i>
                                </button>
                                
                                {/* View Toggle (Future feature) */}
                                <div className="hidden sm:flex items-center space-x-2">
                                    <OutlineButton size="small">
                                        <i className="fas fa-th-large"></i>
                                    </OutlineButton>
                                    <OutlineButton size="small">
                                        <i className="fas fa-list"></i>
                                    </OutlineButton>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="text-center py-16">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
                                <p className="text-gray-600">Loading amazing products for you...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">⚠️</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Oops! Something went wrong
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    We couldn't load the products. Please try again.
                                </p>
                                <PrimaryButton onClick={() => refetch()}>
                                    <i className="fas fa-refresh mr-2"></i>
                                    Try Again
                                </PrimaryButton>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <CustomerCard 
                                        key={product.product_id || product.productId} 
                                        product={product}
                                        showWishlist={true}
                                        showAddToCart={true}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No products found
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {selectedCategory === 'all' 
                                        ? 'No products are available at the moment.' 
                                        : `No products found in "${selectedCategory}" category.`
                                    }
                                </p>
                                <PrimaryButton onClick={() => handleCategorySelect('all')}>
                                    View All Products
                                </PrimaryButton>
                            </div>
                        )}

                        {/* Load More Button (Future feature) */}
                        {products.length > 0 && !loading && (
                            <div className="text-center mt-12">
                                <OutlineButton size="large">
                                    Load More Products
                                </OutlineButton>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllProducts;
