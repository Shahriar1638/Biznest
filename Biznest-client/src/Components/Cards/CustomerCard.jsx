import { useState } from 'react';
import { Link } from 'react-router-dom';
import Rating from 'react-rating';
import { PrimaryButton, SecondaryButton } from '../Buttons';

const CustomerCard = ({ product, showWishlist = true, showAddToCart = true }) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [selectedQuantity, setSelectedQuantity] = useState('');

    const handleWishlistToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsWishlisted(!isWishlisted);
        // Add wishlist API call here
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!selectedQuantity) {
            alert('Please select a quantity option');
            return;
        }
        // Add to cart API call here
        console.log('Adding to cart:', { product: product.productId, quantity: selectedQuantity });
    };

    const handleQuantityChange = (e) => {
        e.stopPropagation();
        setSelectedQuantity(e.target.value);
    };

    // Calculate average rating from the rating array
    const calculateAverageRating = () => {
        if (!product.rating || product.rating.length === 0) return 0;
        const sum = product.rating.reduce((acc, ratingObj) => acc + ratingObj.rate, 0);
        return (sum / product.rating.length).toFixed(1);
    };

    // Get the lowest price from quantity descriptions
    const getLowestPrice = () => {
        if (!product.quantity_description || product.quantity_description.length === 0) return 0;
        return Math.min(...product.quantity_description.map(qty => qty.unit_price));
    };

    const averageRating = calculateAverageRating();
    const lowestPrice = getLowestPrice();

    return (
        <div className="card-biznest overflow-hidden hover:scale-105 transition-transform">
            <Link to={`/product/${product.productId}`}>
                <div className="relative">
                    <img 
                        src={product.product_imgurl || '/default-product.jpg'} 
                        alt={product.product_name}
                        className="w-full h-48 object-cover"
                    />
                    
                    {/* Wishlist Button */}
                    {showWishlist && (
                        <button
                            onClick={handleWishlistToggle}
                            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                isWishlisted 
                                ? 'bg-red-500 text-white' 
                                : 'bg-white text-gray-400 hover:text-red-500'
                            }`}
                        >
                            <i className={`fas fa-heart text-sm ${isWishlisted ? 'text-white' : ''}`}></i>
                        </button>
                    )}

                    {/* Discount Badge */}
                    {product.discount && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            -{product.discount}%
                        </div>
                    )}
                </div>

                <div className="p-4">
                    {/* Product Name */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">
                        {product.product_name}
                    </h3>

                    {/* Rating - Always shown for consistent layout */}
                    <div className="flex items-center mb-2">
                        <Rating
                            initialRating={averageRating}
                            readonly
                            emptySymbol={
                                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            }
                            fullSymbol={
                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            }
                        />
                        <span className="text-xs text-gray-500 ml-1">
                            {product.rating && product.rating.length > 0 ? (
                                <>({averageRating}) • {product.sell_count?.length || 0} sold</>
                            ) : (
                                <>No reviews • {product.sell_count?.length || 0} sold</>
                            )}
                        </span>
                    </div>

                    {/* Price */}
                    <div className="mb-3">
                        <div className="flex items-center space-x-2">
                            {product.quantity_description && product.quantity_description.length > 1 ? (
                                <span className="text-lg font-bold text-amber-600">
                                    From ৳{lowestPrice}
                                </span>
                            ) : (
                                <span className="text-lg font-bold text-amber-600">
                                    ৳{lowestPrice}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Seller Info */}
                    <div className="mb-3 text-xs text-gray-600">
                        <span>Sold by: {product.selleremail || 'BizNest Seller'}</span>
                    </div>

                    {/* Category */}
                    <div className="mb-3">
                        <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            {product.category}
                        </span>
                    </div>
                </div>
            </Link>

            {/* Interactive Elements (outside Link to prevent navigation) */}
            <div className="px-4 pb-4 space-y-3">
                {/* Quantity Selection */}
                {product.quantity_description && product.quantity_description.length > 0 && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <select
                            value={selectedQuantity}
                            onChange={handleQuantityChange}
                            className="input-biznest text-xs w-full"
                            style={{ color: '#000' }}
                        >
                            <option value="">Select quantity</option>
                            {product.quantity_description.map((qty) => (
                                <option key={qty.unitid} value={qty.unitid} style={{ color: '#000' }}>
                                    {qty.unit_value} {qty.unit_type.split('-')[0]} - ৳{qty.unit_price}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {showAddToCart && (
                        <PrimaryButton 
                            size="small" 
                            onClick={handleAddToCart}
                            className="flex-1 text-xs py-2"
                        >
                            <i className="fas fa-shopping-cart mr-1"></i>
                            Add to Cart
                        </PrimaryButton>
                    )}
                    <SecondaryButton 
                        size="small" 
                        className="flex-1 text-xs py-2"
                    >
                        <i className="fas fa-eye mr-1"></i>
                        View
                    </SecondaryButton>
                </div>
            </div>
        </div>
    );
};

export default CustomerCard;
