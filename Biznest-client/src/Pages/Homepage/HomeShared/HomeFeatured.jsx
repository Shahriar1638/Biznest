import { useState, useEffect } from 'react';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import { FeatProductCard } from '../../../Components/Cards';

const HomeFeatured = ({ 
    products = null, 
    loading: externalLoading = null,
    title = "Featured Products",
    description = null,
    apiEndpoint = '/products/featured',
    maxProducts = 8,
    showWishlist = true,
    showAddToCart = true,
    backgroundColor = "bg-gray-50"
}) => {
    const [internalProducts, setInternalProducts] = useState([]);
    const [internalLoading, setInternalLoading] = useState(false);
    const axiosPublic = useAxiosPublic();

    // Use external data if provided, otherwise fetch internal data
    const displayProducts = products !== null ? products : internalProducts;
    const isLoading = externalLoading !== null ? externalLoading : internalLoading;

    // Fetch featured products only if no external data is provided
    useEffect(() => {
        if (products === null) {
            const fetchFeaturedProducts = async () => {
                try {
                    setInternalLoading(true);
                    const response = await axiosPublic.get(apiEndpoint);
                    setInternalProducts(response.data || []);
                } catch (error) {
                    console.error('Error fetching featured products:', error);
                    setInternalProducts([]);
                } finally {
                    setInternalLoading(false);
                }
            };

            fetchFeaturedProducts();
        }
    }, [axiosPublic, apiEndpoint, products]);

    return (
        <section className={`py-16 px-4 ${backgroundColor}`}>
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
                    {title}
                </h2>
                {description && (
                    <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                        {description}
                    </p>
                )}
                
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                        <p className="mt-4 text-gray-600">Loading featured products...</p>
                    </div>
                ) : displayProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {displayProducts.slice(0, maxProducts).map((product) => (
                            <FeatProductCard 
                                key={product.product_id} 
                                product={product}
                                showWishlist={showWishlist}
                                showAddToCart={showAddToCart}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📦</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
                        <p className="text-gray-600">No featured products available at the moment.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default HomeFeatured;
