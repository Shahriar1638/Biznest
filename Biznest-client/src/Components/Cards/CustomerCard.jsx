import { useState } from 'react';
import { Link } from 'react-router-dom';
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

    return (
        <div className="card-biznest overflow-hidden hover:scale-105 transition-transform">
            <Link to={`/product/${product.productId || product.product_id}`}>
                <div className="relative">
                    <img 
                        src={product.product_imgurl || product.imageUrl || '/default-product.jpg'} 
                        alt={product.productname || product.name}
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
                        {product.productname || product.name}
                    </h3>

                    {/* Rating */}
                    {product.rating && (
                        <div className="flex items-center mb-2">
                            <div className="flex text-yellow-400 text-xs">
                                {[...Array(5)].map((_, i) => (
                                    <i 
                                        key={i} 
                                        className={`fas fa-star ${
                                            i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                    ></i>
                                ))}
                            </div>
                            <span className="text-xs text-gray-500 ml-1">
                                ({product.rating}) • {product.sellcount || 0} sold
                            </span>
                        </div>
                    )}

                    {/* Price */}
                    <div className="mb-3">
                        <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-amber-600">
                                ৳{product.price}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-sm text-gray-500 line-through">
                                    ৳{product.originalPrice}
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
                            {product.quantity_description.map((qty, index) => (
                                <option key={index} value={`${qty.amount}${qty.unit}`} style={{ color: '#000' }}>
                                    {qty.amount}{qty.unit} - ৳{qty.price}
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
