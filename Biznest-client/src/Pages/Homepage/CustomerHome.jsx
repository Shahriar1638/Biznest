import { Link } from 'react-router-dom';
import useAuth from '../../Hooks/useAuth';
import { useFeaturedProducts, useWishlist } from '../../Hooks/useProducts';
import { PrimaryButton, SecondaryButton, OutlineButton } from '../../Components/Buttons';
import { FeatProductCard } from '../../Components/Cards';
import HomeSearchBar from './HomeShared/HomeSearchBar';
import HomeCategory from './HomeShared/HomeCategory';
import OfferBannerSlider from './HomeShared/OfferBannerSlider';
import HomeFeatured from './HomeShared/HomeFeatured';

const CustomerHome = () => {
    const { user } = useAuth();
    
    const {
        data: recommendedProducts = [],
        isLoading: recommendedLoading
    } = useFeaturedProducts();

    const {
        data: wishlistProducts = [],
        isLoading: wishlistLoading
    } = useWishlist();

    const loading = recommendedLoading || wishlistLoading;

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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Personalized Greeting */}
            <section className="bg-gradient-to-r from-amber-400 to-orange-400 py-12 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Hi {user?.displayName || 'Valued Customer'}, ready to shop today? 🛍️
                    </h1>
                    <p className="text-xl text-amber-100 mb-6 max-w-2xl mx-auto">
                        Discover amazing deals from your local community and find exactly what you're looking for!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <PrimaryButton 
                            size="large" 
                            className="bg-white text-amber-600 hover:bg-gray-50 w-full sm:w-auto"
                            onClick={() => document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' })}
                        >
                            Start Shopping
                        </PrimaryButton>
                        <SecondaryButton 
                            size="large" 
                            className="!border-white !text-black hover:!bg-white hover:!text-amber-600 w-full sm:w-auto"
                        >
                            View My Orders
                        </SecondaryButton>
                    </div>
                </div>
            </section>

            {/* Offer Banners Slider */}
            <OfferBannerSlider />

            {/* Quick Categories */}
            <HomeCategory categories={categories} />

            {/* Search Section */}
            <section id="search-section" className="py-16 px-4 bg-white">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                        What are you looking for today?
                    </h2>
                    <HomeSearchBar categories={categories} />
                </div>
            </section>

            {/* Recommended Products */}
            <HomeFeatured 
                products={recommendedProducts}
                loading={loading}
                title="✨ Just For You - Trending Products"
                description="Discover what's popular in your area and trending among other shoppers"
                backgroundColor="bg-white"
                maxProducts={8}
                showWishlist={true}
                showAddToCart={true}
            />

            {/* Wishlist Section */}
            {wishlistProducts.length > 0 && (
                <section className="py-16 px-4 bg-amber-50">
                    <div className="container mx-auto">
                        <div className="flex justify-between items-center mb-12">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    💝 Your Wishlist
                                </h2>
                                <p className="text-gray-600">Items you've saved for later</p>
                            </div>
                            <Link to="/wishlist">
                                <OutlineButton>View All</OutlineButton>
                            </Link>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {wishlistProducts.slice(0, 4).map((product) => (
                                <FeatProductCard 
                                    key={product.product_id} 
                                    product={product}
                                    showWishlist={true}
                                    showAddToCart={true}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Trust & Support Section */}
            <section className="py-16 px-4 bg-gray-100">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Shop with Confidence
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                                🔒
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Payments</h3>
                            <p className="text-gray-600">
                                Your payment information is protected with bank-level encryption and secure processing.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                                🛡️
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Buyer Protection</h3>
                            <p className="text-gray-600">
                                Shop worry-free with our comprehensive buyer protection and return policy.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                                💬
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">24/7 Support</h3>
                            <p className="text-gray-600">
                                Need help? Our friendly customer support team is here for you around the clock.
                            </p>
                        </div>
                    </div>
                    
                    <div className="text-center mt-12">
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/support">
                                <SecondaryButton size="large">
                                    Contact Support
                                </SecondaryButton>
                            </Link>
                            <Link to="/faq">
                                <OutlineButton size="large">
                                    View FAQs
                                </OutlineButton>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CustomerHome;