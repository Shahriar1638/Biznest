import useAuth from '../../../Hooks/useAuth';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const AddToCart = ({ 
    product, 
    selectedQuantity, 
    onSuccess = () => {}, 
    onError = () => {},
    showAlert = true 
}) => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    const handleAddToCart = async () => {
        // Validation: Check if quantity is selected
        if (!selectedQuantity) {
            const errorMessage = 'Please select a quantity option';
            if (showAlert) alert(errorMessage);
            onError(errorMessage);
            return false;
        }

        // Validation: Check if user is logged in
        if (!user) {
            const errorMessage = 'Please log in to add items to cart';
            if (showAlert) alert(errorMessage);
            onError(errorMessage);
            return false;
        }

        // Create UserCart object
        const UserCart = {
            selleremail: product.selleremail,
            customeremail: user.email,
            unitid: selectedQuantity,
            productId: product.productId,
            unitquantity: 1
        };

        try {
            // Send cart data to backend API
            const response = await axiosSecure.post('/user/cart', UserCart);
            
            // Log the UserCart object to console
            console.log('UserCart object sent to API:', UserCart);
            console.log('API Response:', response.data);
            
            // Success callback
            onSuccess(UserCart);
            
            // Show success message with SweetAlert2
            if (showAlert) {
                Swal.fire({
                    icon: 'success',
                    title: 'Added to Cart!',
                    text: 'Item has been successfully added to your cart.',
                    timer: 2000
                });
            }
            
            return true;
        } catch (error) {
            // Handle API error
            console.error('Add to cart API error:', error);
            
            const errorMessage = error.response?.data?.message || 'Failed to add item to cart. Please try again.';
            
            // Error callback
            onError(errorMessage);
            
            // Show error message
            if (showAlert) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorMessage,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#d33'
                });
            }
            
            return false;
        }
    };

    return { handleAddToCart };
};

export default AddToCart;
