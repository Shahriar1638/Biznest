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
            setSearchResults([]);
            return;
        }

        setLoading(true);
        try {
            const searchinfo = {
                text: searchQuery.trim(),
                category: selectedCategory
            };

            const response = await axiosPublic.post('/products/search', { searchinfo });
            
            if (response.data.success) {
                setSearchResults(response.data.data || []);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (!value.trim() && !selectedCategory) {
            setSearchResults([]);
        }
    };

    const handleCategoryChange = async (e) => {
        const value = e.target.value;
        setSelectedCategory(value);
        if (searchQuery.trim() || value) {
            setLoading(true);
            try {
                const searchinfo = {
                    text: searchQuery.trim(),
                    category: value
                };

                const response = await axiosPublic.post('/products/search', { searchinfo });
                
                if (response.data.success) {
                    setSearchResults(response.data.data || []);
                } else {
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        } else {
            setSearchResults([]);
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
                                    onChange={handleInputChange}
                                    className="input-biznest w-full"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <div className="md:w-64">
                                <select
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
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
            {(loading || searchResults.length > 0 || (searchQuery.trim() || selectedCategory)) && (
                <section className="py-8 px-4 bg-gray-50">
                    <div className="container mx-auto">
                        {(searchQuery.trim() || selectedCategory) && (
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    Search Results
                                </h3>
                                <p className="text-gray-600">
                                    {searchQuery.trim() && selectedCategory 
                                        ? `Searching for "${searchQuery}" in ${selectedCategory}`
                                        : searchQuery.trim() 
                                            ? `Searching for "${searchQuery}" in all categories`
                                            : `Showing all products in ${selectedCategory}`
                                    }
                                </p>
                            </div>
                        )}
                        
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                                <p className="mt-4 text-gray-600">Searching products...</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {searchResults.map((product) => (
                                        <FeatProductCard 
                                            key={product.productId || product._id} 
                                            product={product}
                                            showWishlist={true}
                                            showAddToCart={true}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (searchQuery.trim() || selectedCategory) ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-600">
                                    No products match your search criteria. Try adjusting your search terms or category.
                                </p>
                            </div>
                        ) : null}
                    </div>
                </section>
            )}
        </div>
    );
};

export default HomeSearchBar;
