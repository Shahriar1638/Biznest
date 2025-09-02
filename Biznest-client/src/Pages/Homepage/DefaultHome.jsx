import { Link } from 'react-router-dom';
import { PrimaryButton, SecondaryButton, OutlineButton } from '../../Components/Buttons';
import HomeSearchBar from './HomeShared/HomeSearchBar';
import HomeCategory from './HomeShared/HomeCategory';
import HomeFeatured from './HomeShared/HomeFeatured';

const DefaultHome = () => {
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
            <HomeCategory categories={categories} />

            {/* Search Bar + Categories */}
            <section id="explore-section" className="py-16 px-4 bg-white">
                <div className="container mx-auto">
                    <HomeSearchBar 
                        categories={categories}
                    />
                </div>
            </section>

            {/* Featured Products */}
            <HomeFeatured />

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