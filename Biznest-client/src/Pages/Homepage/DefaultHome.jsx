import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { PrimaryButton, SecondaryButton, OutlineButton } from '../../Components/Buttons';
import { FeatProductCard } from '../../Components/Cards';

const DefaultHome = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const axiosPublic = useAxiosPublic();

    // Fetch featured products
    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setLoading(true);
                const response = await axiosPublic.get('/products/featured');
                setFeaturedProducts(response.data || []);
            } catch (error) {
                console.error('Error fetching featured products:', error);
                setFeaturedProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, [axiosPublic]);

    // Categories with icons
    const categories = [
        { name: 'Groceries & Pantry', icon: '🛒', color: 'bg-green-100 text-green-700' },
        { name: 'Kids & Baby', icon: '👶', color: 'bg-pink-100 text-pink-700' },
        { name: 'Electronics & Gadgets', icon: '📱', color: 'bg-blue-100 text-blue-700' },
        { name: 'Home & Kitchen Appliances', icon: '🏠', color: 'bg-purple-100 text-purple-700' },
        { name: 'Health & Personal Care', icon: '💊', color: 'bg-red-100 text-red-700' },
        { name: 'Beauty & Lifestyle', icon: '💄', color: 'bg-amber-100 text-amber-700' },
        { name: 'Fashion & Cosmetics', icon: '👗', color: 'bg-indigo-100 text-indigo-700' },
        { name: 'Sports & Fitness', icon: '⚽', color: 'bg-orange-100 text-orange-700' },
        { name: 'Books, Stationery & Hobbies', icon: '📚', color: 'bg-emerald-100 text-emerald-700' },
        { name: 'Home & Garden', icon: '🌱', color: 'bg-lime-100 text-lime-700' }
    ];

    const handleSearch = () => {
        // Handle search functionality - navigate to products page with filters
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (selectedCategory) params.append('category', selectedCategory);
        
        // Navigate to products page with search params
        window.location.href = `/products?${params.toString()}`;
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Banner */}
            <section className="relative bg-gradient-to-br from-amber-50 to-orange-50 py-20 px-4">
                <div className="container mx-auto text-center">
                    <div className="animate-fade-in">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            Discover Local Treasures on 
                            <span className="text-amber-600"> BizNest!</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
                            Shop Small, Support Local
                        </p>
                        <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
                            Connect with local businesses in your community. Find unique products, support small sellers, and discover amazing deals right in your neighborhood.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link to="/signup">
                                <PrimaryButton size="large" className="w-full sm:w-auto">
                                    Join BizNest Today
                                </PrimaryButton>
                            </Link>
                            <PrimaryButton 
                                size="large" 
                                onClick={() => document.getElementById('explore-section').scrollIntoView({ behavior: 'smooth' })}
                                className="w-full sm:w-auto"
                            >
                                Explore Products
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Highlight */}
            <section className="py-16 px-4 bg-gray-50">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Shop by Category
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {categories.map((category, index) => (
                            <div 
                                key={index}
                                className="card-biznest p-6 text-center hover:scale-105 transition-transform cursor-pointer"
                                onClick={() => setSelectedCategory(category.name)}
                            >
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${category.color} flex items-center justify-center text-2xl`}>
                                    {category.icon}
                                </div>
                                <h3 className="font-medium text-gray-900 text-sm leading-tight">
                                    {category.name}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Search Bar + Categories */}
            <section id="explore-section" className="py-16 px-4 bg-white">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                        Start Exploring Now
                    </h2>
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col items-center md:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search for products, brands, or sellers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input-biznest w-full"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <div className="md:w-64">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="input-biznest w-full"
                                    style={{ color: '#000' }}
                                >
                                    <option value="" style={{ color: '#000' }}>All Categories</option>
                                    {categories.map((category, index) => (
                                        <option key={index} value={category.name} style={{ color: '#000' }}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <PrimaryButton onClick={handleSearch} size="large">
                                Search
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-16 px-4 bg-gray-50">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Featured Products
                    </h2>
                    
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                            <p className="mt-4 text-gray-600">Loading featured products...</p>
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredProducts.slice(0, 8).map((product) => (
                                <FeatProductCard 
                                    key={product.product_id} 
                                    product={product}
                                    showWishlist={true}
                                    showAddToCart={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-600">No featured products available at the moment.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Why BizNest? */}
            <section className="py-16 px-4 bg-white">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Why Choose BizNest?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                                🏪
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Support Local Sellers</h3>
                            <p className="text-gray-600">
                                Help small businesses in your community thrive by shopping locally and supporting entrepreneurs.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                                ✨
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Buy Unique Items</h3>
                            <p className="text-gray-600">
                                Discover one-of-a-kind products you won't find anywhere else, crafted with love by local artisans.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                                🔒
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy & Secure Payments</h3>
                            <p className="text-gray-600">
                                Shop with confidence using our secure payment system and enjoy hassle-free transactions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Seller Call-to-Action */}
            <section className="py-16 px-4 bg-gradient-to-r from-amber-500 to-orange-500">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Own a Business?
                    </h2>
                    <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of successful sellers on BizNest! Start selling your products today and reach customers in your local community.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to="/signup">
                            <SecondaryButton size="large" className="bg-white text-amber-600 hover:bg-gray-50 w-full sm:w-auto">
                                Become a Seller
                            </SecondaryButton>
                        </Link>
                        <OutlineButton 
                            size="large" 
                            className="!border-white !text-white !bg-orange-300 hover:!bg-white hover:!text-orange-500 hover:!border-orange-500 w-full sm:w-auto"
                        >
                            Learn More
                        </OutlineButton>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DefaultHome;