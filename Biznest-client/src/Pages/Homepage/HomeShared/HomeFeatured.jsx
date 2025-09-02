import { useState, useEffect } from 'react';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import { FeatProductCard } from '../../../Components/Cards';

const HomeFeatured = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
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

    return (
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
    );
};

export default HomeFeatured;
