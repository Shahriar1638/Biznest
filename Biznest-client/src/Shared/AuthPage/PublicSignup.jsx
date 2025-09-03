import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../Hooks/useAuth';
import { PrimaryButton } from '../../Components/Buttons';
import logo from '../../assets/logo.png';

const PublicSignup = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        phone_number: '',
        gender: '',
        address: '',
        role: {
            type: 'customer',
            details: {}
        },
        profileurl: '',
        ban_status: false
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { signupUser } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'roleType') {
            setFormData({
                ...formData,
                role: {
                    ...formData.role,
                    type: value,
                    details: value === 'customer' ? { customerID:'', points: 0, wishlist: [] } : 
                            value === 'seller' ? { sellerID:'' ,revenue: 0, numOfApproved: 0, numOfReject: 0 } :
                            { adminID:'',salary: 0 }
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) return;
        
        setIsLoading(true);

        try {
            // Remove confirmPassword before sending
            const { confirmPassword: _, ...submitData } = formData;
            await signupUser(submitData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center space-x-3 mb-6">
                        <img 
                            src={logo} 
                            alt="BizNest Logo" 
                            className="h-12 w-12 object-contain"
                        />
                        <h1 className="text-3xl font-bold text-gray-900">
                            Biz<span className="text-amber-600">Nest</span>
                        </h1>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Join BizNest Today
                    </h2>
                    <p className="text-gray-600">
                        Create your account and start connecting with local businesses
                    </p>
                </div>

                {/* Signup Form */}
                <div className="card-biznest p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className="input-biznest"
                                    style={{ color: '#1f2937' }}
                                    required
                                />
                            </div>

                            {/* Username */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Choose a username"
                                    className="input-biznest"
                                    style={{ color: '#1f2937' }}
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="input-biznest"
                                    style={{ color: '#1f2937' }}
                                    required
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    className="input-biznest"
                                    style={{ color: '#1f2937' }}
                                    required
                                />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    id="phone_number"
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="123-456-7890"
                                    className="input-biznest"
                                    style={{ color: '#1f2937' }}
                                    required
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="input-biznest"
                                    style={{ color: '#1f2937' }}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>

                            {/* Role Type */}
                            <div>
                                <label htmlFor="roleType" className="block text-sm font-medium text-gray-700 mb-2">
                                    Account Type
                                </label>
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 rounded-lg opacity-75 animate-pulse"></div>
                                    <select
                                        id="roleType"
                                        name="roleType"
                                        value={formData.role.type}
                                        onChange={handleChange}
                                        className="input-biznest relative bg-white"
                                        style={{ color: '#1f2937' }}
                                        required
                                    >
                                        <option value="customer" style={{ color: '#1f2937' }}>Customer</option>
                                        <option value="seller" style={{ color: '#1f2937' }}>Seller</option>
                                    </select>
                                </div>
                            </div>

                            {/* Profile URL */}
                            <div>
                                <label htmlFor="profileurl" className="block text-sm font-medium text-gray-700 mb-2">
                                    Profile Image URL
                                </label>
                                <input
                                    id="profileurl"
                                    type="url"
                                    name="profileurl"
                                    value={formData.profileurl}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                    className="input-biznest"
                                    style={{ color: '#1f2937' }}
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                Address
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter your full address"
                                rows="3"
                                className="input-biznest resize-none"
                                style={{ color: '#1f2937' }}
                                required
                            />
                        </div>

                        {/* Role-specific information display */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-amber-800 mb-1">
                                        Account Type: {formData.role.type === 'customer' ? 'Customer' : 'Seller'}
                                    </h3>
                                    <div className="text-sm text-amber-700">
                                        {formData.role.type === 'customer' && (
                                            <p>As a customer, you can browse and purchase products from our marketplace.</p>
                                        )}
                                        {formData.role.type === 'seller' && (
                                            <p>As a seller, you can list and sell your products on our marketplace.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <PrimaryButton 
                            type="submit" 
                            size="large"
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                                    </svg>
                                    Creating Account...
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </PrimaryButton>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">OR</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-amber-600 hover:text-amber-500 font-medium">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicSignup;