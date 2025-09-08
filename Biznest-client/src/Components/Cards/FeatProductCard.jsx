import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Rating from 'react-rating';
import { PrimaryButton, OutlineButton } from '../Buttons';
import { AddToCart } from '../../Pages/All Products/AddtoCart';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import useAuth from '../../Hooks/useAuth';
import Swal from 'sweetalert2';

const FeatProductCard = ({ product, showWishlist = true, showAddToCart = true }) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [selectedQuantity, setSelectedQuantity] = useState('');
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    
    const { user, updateUser } = useAuth();
    const axiosSecure = useAxiosSecure();

    // Check if product is in wishlist when component mounts
    useEffect(() => {
        const checkWishlistStatus = () => {
            if (!user?.email || user.role?.type !== 'customer') {
                setIsWishlisted(false);
                return;
            }
            
            // Check from local user data first
            const wishlistProductIds = user.role?.details?.wishlist || [];
            setIsWishlisted(wishlistProductIds.includes(product.productId));
        };

        checkWishlistStatus();
    }, [user, product.productId]);

    // Get the first quantity option for display
    const firstQuantity = product.quantity_description?.[0];
    const displayPrice = firstQuantity?.unit_price || 0;
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

    // Initialize AddToCart hook
    const addToCartHook = AddToCart({ 
        product, 
        selectedQuantity,
        onSuccess: (userCart) => {
            console.log('Successfully added to cart from featured product:', userCart);
        },
        onError: (error) => {
            console.error('Add to cart error from featured product:', error);
        }
    });

    // Handle wishlist toggle
    const handleWishlistClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: 'Login Required',
                text: 'Please login to add items to your wishlist.',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        try {
            setIsWishlistLoading(true);
            
            // Send the productId to the wishlist API with user email
            const response = await axiosSecure.post(`/user/wishlist/${product.productId}`, {
                userEmail: user.email
            });
            
            if (response.data.success) {
                // Update the state based on the action returned from API
                const newWishlistState = response.data.action === 'added';
                setIsWishlisted(newWishlistState);
                
                // Update user data in localStorage and state
                if (user && user.role && user.role.type === 'customer') {
                    const updatedUser = { ...user };
                    
                    // Initialize wishlist if it doesn't exist
                    if (!updatedUser.role.details.wishlist) {
                        updatedUser.role.details.wishlist = [];
                    }
                    
                    if (response.data.action === 'added') {
                        // Add product to wishlist if not already there
                        if (!updatedUser.role.details.wishlist.includes(product.productId)) {
                            updatedUser.role.details.wishlist.push(product.productId);
                        }
                    } else {
                        // Remove product from wishlist
                        updatedUser.role.details.wishlist = updatedUser.role.details.wishlist.filter(
                            id => id !== product.productId
                        );
                    }
                    
                    // Update user data in context and localStorage
                    updateUser(updatedUser);
                }
                
                Swal.fire({
                    icon: 'success',
                    title: response.data.action === 'added' ? 'Added to Wishlist' : 'Removed from Wishlist',
                    text: response.data.message,
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            }
        } catch (error) {
            console.error('Wishlist error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update wishlist. Please try again.',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsWishlistLoading(false);
        }
    };

    // Handle add to cart
    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCartHook.handleAddToCart();
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
                            disabled={isWishlistLoading}
                            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                                isWishlistLoading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : isWishlisted 
                                        ? 'bg-red-500 text-white' 
                                        : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
                            }`}
                        >
                            {isWishlistLoading ? (
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            )}
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

                {/* Price and Rating */}
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
                    
                    {/* Rating Display - Always shown for consistent layout */}
                    <div className="flex items-center">
                        <Rating
                            initialRating={parseFloat(averageRating)}
                            readonly
                            emptySymbol={
                                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            }
                            fullSymbol={
                                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            }
                        />
                        <span className="text-sm text-gray-500 ml-1">
                            {product.rating && product.rating.length > 0 ? (
                                <>({averageRating})</>
                            ) : (
                                <>(No reviews)</>
                            )}
                        </span>
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
                                    setSelectedQuantity(e.target.value);
                                }}
                                className="w-full text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                onMouseDown={(e) => e.stopPropagation()}
                                onFocus={(e) => e.stopPropagation()}
                            >
                                <option value="">Select quantity</option>
                                {product.quantity_description && product.quantity_description.length > 0 ? (
                                    product.quantity_description.map((qty) => (
                                        <option key={qty.unitid} value={qty.unitid}>
                                            {qty.unit_value} {qty.unit_type?.split('-')[0] || qty.unit_type} - ৳{qty.unit_price}
                                            {qty.unit_quantity > 0 ? ` (${qty.unit_quantity} available)` : ' (Out of stock)'}
                                        </option>
                                    ))
                                ) : (
                                    <option value="default">1 piece (In stock)</option>
                                )}
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <PrimaryButton 
                                size="small"
                                onClick={handleAddToCart}
                                disabled={availability !== 'in_stock' || !selectedQuantity}
                                className="flex-1"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L3 3H1m6 10v6a2 2 0 002 2h8a2 2 0 002-2v-6m-10 6V9a2 2 0 012-2h8a2 2 0 012 2v8" />
                                </svg>
                                {!selectedQuantity ? 'Select Quantity' : 'Add to Cart'}
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
