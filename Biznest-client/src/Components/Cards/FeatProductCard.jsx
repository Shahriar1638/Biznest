import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryButton, OutlineButton } from '../Buttons';

const FeatProductCard = ({ product, showWishlist = true, showAddToCart = true }) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [selectedQuantity, setSelectedQuantity] = useState(0);
    const [showFullDescription, setShowFullDescription] = useState(false);

    // Get the first quantity option for display
    const firstQuantity = product.quantity_description?.[0];
    const displayPrice = product.price || 0;
    const displayUnit = firstQuantity?.unit_type?.split('-')[1] || '';

    // Calculate average rating
    const averageRating = product.rating?.length > 0 
        ? (product.rating.reduce((sum, r) => sum + r.rate, 0) / product.rating.length).toFixed(1)
        : '0.0';

    // Determine availability based on quantity
    const availability = firstQuantity?.unit_quantity > 0 ? 'in_stock' : 'out_of_stock';

    // Description handling
    const maxDescriptionLength = 75;
    const description = product.description || `Quality ${product.category.toLowerCase()} product from our marketplace`;
    const needsTruncation = description.length > maxDescriptionLength;
    const displayDescription = showFullDescription || !needsTruncation 
        ? description 
        : description.substring(0, maxDescriptionLength);

    // Handle wishlist toggle
    const handleWishlistClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsWishlisted(!isWishlisted);
        // TODO: Implement actual wishlist API call
    };

    // Handle add to cart
    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // TODO: Implement actual add to cart functionality
        console.log('Added to cart:', product.productId);
    };

    // Handle image error
    const handleImageError = () => {
        setImageError(true);
    };

    // Handle description toggle
    const handleDescriptionToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowFullDescription(!showFullDescription);
    };

    return (
        <div className="card-biznest group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            {/* Product Image - Clickable */}
            <Link to={`/product/${product.productId}`} className="block">
                <div className="relative overflow-hidden rounded-t-xl h-48 bg-gray-100">
                    {!imageError ? (
                        <img
                            src={product.product_imgurl}
                            alt={product.product_name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={handleImageError}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                    
                    {/* Wishlist Button */}
                    {showWishlist && (
                        <button
                            onClick={handleWishlistClick}
                            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                                isWishlisted 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
                            }`}
                        >
                            <svg className="w-5 h-5" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                        <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {product.category}
                        </span>
                    </div>

                    {/* Stock Status */}
                    <div className="absolute bottom-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            availability === 'in_stock' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {availability === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>
                </div>
            </Link>

            {/* Product Info - Not clickable for navigation */}
            <div className="p-5">
                {/* Product Name - Clickable */}
                <Link to={`/product/${product.productId}`} className="block">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors duration-200">
                        {product.product_name}
                    </h3>
                </Link>

                {/* Product Description - Fixed height with expand option */}
                <div className="mb-3 h-12 flex flex-col justify-start">
                    <p className="text-gray-600 text-sm leading-tight">
                        {displayDescription}
                        {needsTruncation && !showFullDescription && (
                            <button 
                                onClick={handleDescriptionToggle}
                                className="text-amber-600 hover:text-amber-700 ml-1 font-medium"
                            >
                                ......
                            </button>
                        )}
                        {needsTruncation && showFullDescription && (
                            <button 
                                onClick={handleDescriptionToggle}
                                className="text-amber-600 hover:text-amber-700 ml-1 font-medium"
                            >
                                {' '}Show less
                            </button>
                        )}
                    </p>
                </div>

                {/* Seller Info */}
                <div className="flex items-center mb-3">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm text-gray-500">
                        by <span className="font-medium text-gray-700">{product.selleremail}</span>
                    </span>
                </div>

                {/* Price and Unit */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <span className="text-2xl font-bold text-amber-600">
                            ৳{displayPrice}
                        </span>
                        {displayUnit && (
                            <span className="text-sm text-gray-500 ml-1">
                                /{displayUnit}
                            </span>
                        )}
                    </div>
                    
                    {/* Rating Display */}
                    <div className="flex items-center">
                        <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-4 h-4 ${i < Math.floor(averageRating) ? 'fill-current' : 'stroke-current fill-none'}`} viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-1">({averageRating})</span>
                    </div>
                </div>

                {/* Action Buttons with Quantity Dropdown */}
                {showAddToCart && (
                    <div className="space-y-3">
                        {/* Quantity Dropdown - Always shown for consistency */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Quantity:</label>
                            <select
                                value={selectedQuantity}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    setSelectedQuantity(parseInt(e.target.value));
                                }}
                                className="w-full text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                onMouseDown={(e) => e.stopPropagation()}
                                onFocus={(e) => e.stopPropagation()}
                            >
                                {product.quantity_description && product.quantity_description.length > 0 ? (
                                    product.quantity_description.map((qty, index) => (
                                        <option key={index} value={index}>
                                            {qty.unit_value} {qty.unit_type?.split('-')[1] || qty.unit_type}
                                            {qty.unit_quantity > 0 ? ` (${qty.unit_quantity} available)` : ' (Out of stock)'}
                                        </option>
                                    ))
                                ) : (
                                    <option value={0}>1 piece (In stock)</option>
                                )}
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <PrimaryButton 
                                size="small"
                                onClick={handleAddToCart}
                                disabled={availability !== 'in_stock'}
                                className="flex-1"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L3 3H1m6 10v6a2 2 0 002 2h8a2 2 0 002-2v-6m-10 6V9a2 2 0 012-2h8a2 2 0 012 2v8" />
                                </svg>
                                Add to Cart
                            </PrimaryButton>
                            
                            <Link to={`/product/${product.productId}`}>
                                <OutlineButton 
                                    size="small"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </OutlineButton>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeatProductCard;
