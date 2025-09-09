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
        if (!selectedQuantity) {
            const errorMessage = 'Please select a quantity option';
            if (showAlert) alert(errorMessage);
            onError(errorMessage);
            return false;
        }

        if (!user) {
            const errorMessage = 'Please log in to add items to cart';
            if (showAlert) alert(errorMessage);
            onError(errorMessage);
            return false;
        }

        const UserCart = {
            selleremail: product.selleremail,
            customeremail: user.email,
            unitid: selectedQuantity,
            productId: product.productId,
            unitquantity: 1
        };

        try {
            const response = await axiosSecure.post('/user/cart', UserCart);
            console.log('UserCart object sent to API:', UserCart);
            console.log('API Response:', response.data);
            onSuccess(UserCart);
            
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
            console.error('Add to cart API error:', error);
            
            const errorMessage = error.response?.data?.message || 'Failed to add item to cart. Please try again.';
            onError(errorMessage);
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
