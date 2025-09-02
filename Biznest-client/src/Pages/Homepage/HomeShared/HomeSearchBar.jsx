import { useState } from 'react';
import { PrimaryButton } from '../../../Components/Buttons';
import { FeatProductCard } from '../../../Components/Cards';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';

const HomeSearchBar = ({ categories }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const axiosPublic = useAxiosPublic();

    const handleSearch = async () => {
        if (!searchQuery.trim() && !selectedCategory) {
            return;
        }

        setLoading(true);
        try {
            const searchinfo = {
                text: searchQuery,
                category: selectedCategory
            };

            const response = await axiosPublic.post('/products/search', { searchinfo });
            setSearchResults(response.data || []);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
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

            {/* Search Results Section */}
            {(loading || searchResults.length > 0) && (
                <section className="py-16 px-4 bg-gray-50">
                    <div className="container mx-auto">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                            Search Results
                        </h2>
                        
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                                <p className="mt-4 text-gray-600">Searching products...</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {searchResults.map((product) => (
                                    <FeatProductCard 
                                        key={product.product_id || product.id} 
                                        product={product}
                                        showWishlist={true}
                                        showAddToCart={true}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-600">No products found matching your search criteria.</p>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
};

export default HomeSearchBar;
