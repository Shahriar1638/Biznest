import { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { PrimaryButton, SecondaryButton } from '../../../Components/Buttons';
import useAuth from '../../../Hooks/useAuth';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import Swal from 'sweetalert2';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_API_KEY);

const PaymentForm = ({ cartData, totalAmount, onPaymentSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [cardComplete, setCardComplete] = useState(false);
    
    const [billingInfo, setBillingInfo] = useState({
        email: user?.email || '',
        name: user?.username || user?.displayName || '',
        address: {
            line1: '',
            city: '',
            postal_code: '',
            country: 'BD',
            state: ''
        }
    });

    useEffect(() => {
        if (user) {
            setBillingInfo(prev => ({
                ...prev,
                email: user.email || prev.email,
                name: user.username || user.displayName || prev.name
            }));
        }
    }, [user]);

    const handleBillingChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setBillingInfo(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setBillingInfo(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleCardChange = (event) => {
        setCardComplete(event.complete);
        setPaymentError(event.error ? event.error.message : null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!stripe || !elements) {
            return;
        }

        if (!cardComplete) {
            setPaymentError('Please complete your card information');
            return;
        }

        setIsProcessing(true);
        setPaymentError(null);

        const cardElement = elements.getElement(CardElement);

        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: billingInfo.name,
                    email: billingInfo.email,
                    address: billingInfo.address
                }
            });

            if (error) {
                setPaymentError(error.message);
                setIsProcessing(false);
                return;
            }

            const orderID = `ORDER_${Date.now()}`;
            const payment_date = new Date().toISOString();
            
            const processedCartItems = cartData?.map((item) => ({
                productid: item.productId,
                unitId: item.unitid,
                quantity: item.unitquantity,
                price: 0
            })) || [];

            const paymentData = {
                customerid: user?.uid || user?.id || `CUSTOMER_${Date.now()}`,
                customer_email: billingInfo.email,
                address: user.address,
                phone: user.phone_number,
                payment_amount: totalAmount,
                orderID: orderID,
                itemcount: cartData?.length || 0,
                currency: 'bdt',
                payment_date: payment_date,
                paymentMethodId: paymentMethod.id,
                billingrelated_infos: {
                    name: billingInfo.name,
                    city: billingInfo.address.city,
                    state: billingInfo.address.state,
                    postal_code: billingInfo.address.postal_code,
                    country: billingInfo.address.country
                },
                cartitems: processedCartItems
            };

            const response = await axiosSecure.post('/user/process-payment', paymentData);
            
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Payment Successful!',
                    text: `Your payment of ৳${totalAmount} has been processed successfully. Transaction ID: ${response.data.transactionId}`,
                    confirmButtonText: 'Continue',
                    confirmButtonColor: '#f59e0b'
                }).then(() => {
                    onPaymentSuccess(response.data);
                    navigate('/customer-home');
                });
            } else {
                throw new Error(response.data.message || 'Payment processing failed');
            }

        } catch (error) {
            console.error('Payment processing error:', error);
            
            if (error.response?.data?.error_type === 'card_error') {
                setPaymentError(error.response.data.message);
            } else if (error.response?.data?.message) {
                setPaymentError(error.response.data.message);
            } else {
                setPaymentError('Payment processing failed. Please try again.');
            }
            
            Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: error.response?.data?.message || 'There was an error processing your payment. Please try again.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
                    <p className="text-gray-600">Secure payment powered by Stripe</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Payment Form */}
                    <div className="card-biznest p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Billing Information */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={billingInfo.name}
                                            onChange={(e) => handleBillingChange('name', e.target.value)}
                                            className="input-biznest text-black"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={billingInfo.email}
                                            onChange={(e) => handleBillingChange('email', e.target.value)}
                                            className="input-biznest text-black"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address Line
                                    </label>
                                    <input
                                        type="text"
                                        value={user.address}
                                        onChange={(e) => handleBillingChange('address.line1', e.target.value)}
                                        className="input-biznest text-black"
                                        placeholder="Street address"
                                        required
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            onChange={(e) => handleBillingChange('address.city', e.target.value)}
                                            className="input-biznest text-black"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Region
                                        </label>
                                        <input
                                            type="text"
                                            onChange={(e) => handleBillingChange('address.state', e.target.value)}
                                            className="input-biznest text-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Postal Code
                                        </label>
                                        <input
                                            type="text"
                                            onChange={(e) => handleBillingChange('address.postal_code', e.target.value)}
                                            className="input-biznest text-black"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card Information */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Card Information</h3>
                                <div className="border border-gray-300 rounded-lg p-4 bg-white">
                                    <CardElement
                                        onChange={handleCardChange}
                                        options={{
                                            disableLink: true,
                                            style: {
                                                base: {
                                                    fontSize: '16px',
                                                    color: '#000000',
                                                    fontFamily: 'system-ui, -apple-system, sans-serif',
                                                    '::placeholder': {
                                                        color: '#6b7280',
                                                    },
                                                },
                                                invalid: {
                                                    color: '#dc2626',
                                                },
                                                complete: {
                                                    color: '#000000',
                                                }
                                            },
                                        }}
                                    />
                                </div>
                                
                                {/* Test Card Information */}
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800 font-medium mb-2">Test Card Numbers:</p>
                                    <div className="text-xs text-blue-700 space-y-1">
                                        <p><strong>Success:</strong> 4242 4242 4242 4242</p>
                                        <p><strong>Declined:</strong> 4000 0000 0000 0002</p>
                                        <p><strong>Insufficient Funds:</strong> 4000 0000 0000 9995</p>
                                        <p>Use any future date for expiry, any 3-digit CVC</p>
                                    </div>
                                </div>
                            </div>

                            {/* Error Display */}
                            {paymentError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-800">{paymentError}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-4 pt-4">
                                <SecondaryButton 
                                    type="button"
                                    onClick={onCancel}
                                    className="flex-1"
                                    disabled={isProcessing}
                                >
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton
                                    type="submit"
                                    disabled={!stripe || isProcessing || !cardComplete}
                                    className="flex-1"
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                                                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                                            </svg>
                                            Processing...
                                        </div>
                                    ) : (
                                        `Pay ৳${totalAmount}`
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="card-biznest p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                        
                        {/* Cart Items */}
                        <div className="space-y-4 mb-6">
                            {cartData?.map((item) => (
                                <div key={item._id} className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">Product Item</p>
                                        <p className="text-sm text-gray-600">Qty: {item.unitquantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pricing Summary */}
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between">
                                <span className="text-gray-800">Items ({cartData?.length || 0}):</span>
                                <span className="font-medium text-gray-600">৳{(totalAmount - 50).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-800">Shipping:</span>
                                <span className="font-medium text-gray-600">৳50</span>
                            </div>
                            <hr className="border-gray-200" />
                            <div className="flex justify-between text-lg font-semibold">
                                <span className='text-black'>Total:</span>
                                <span className="text-amber-600">৳{totalAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <p className="text-sm text-green-800">
                                    Your payment is secured by Stripe encryption
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProcessPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get cart data from navigation state
    const { cartData, totalAmount, userEmail } = location.state || {};
    
    // Redirect to cart if no data
    if (!cartData || !totalAmount) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Complete Your Payment</h1>
                
                <Elements stripe={stripePromise}>
                    <PaymentForm 
                        cartData={cartData}
                        totalAmount={totalAmount}
                        userEmail={userEmail}
                        onPaymentSuccess={() => {
                            console.log('Payment successful!');
                        }}
                        onCancel={() => {
                            navigate('/customer-home');
                        }}
                    />
                </Elements>
            </div>
        </div>
    );
};

export default ProcessPayment;
