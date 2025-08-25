import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../Hooks/useAuth';

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
                    details: value === 'customer' ? { points: 0 } : 
                            value === 'seller' ? { revenue: 0, numOfApproved: 0, numOfReject: 0 } :
                            { salary: 0 }
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
        <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-8">
            <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl font-bold text-center mb-6">Join BizNest</h2>
                    
                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Email */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Email *</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className="input input-bordered"
                                    required
                                />
                            </div>

                            {/* Username */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Username *</span>
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Choose a username"
                                    className="input input-bordered"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Password *</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="input input-bordered"
                                    required
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Confirm Password *</span>
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    className="input input-bordered"
                                    required
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Phone Number *</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="123-456-7890"
                                    className="input input-bordered"
                                    required
                                />
                            </div>

                            {/* Gender */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Gender *</span>
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="select select-bordered"
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Role Type */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Account Type *</span>
                                </label>
                                <select
                                    name="roleType"
                                    value={formData.role.type}
                                    onChange={handleChange}
                                    className="select select-bordered"
                                    required
                                >
                                    <option value="customer">Customer</option>
                                    <option value="seller">Seller</option>
                                </select>
                            </div>

                            {/* Profile URL */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Profile Image URL</span>
                                </label>
                                <input
                                    type="url"
                                    name="profileurl"
                                    value={formData.profileurl}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                    className="input input-bordered"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Address *</span>
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter your full address"
                                className="textarea textarea-bordered"
                                rows="3"
                                required
                            />
                        </div>

                        {/* Role-specific information display */}
                        <div className="alert alert-info">
                            <div>
                                <h3 className="font-bold">Account Type: {formData.role.type}</h3>
                                <div className="text-sm">
                                    {formData.role.type === 'customer' && (
                                        <p>As a customer, you can browse and purchase products from our marketplace.</p>
                                    )}
                                    {formData.role.type === 'seller' && (
                                        <p>As a seller, you can list and sell your products on our marketplace.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="form-control mt-6">
                            <button 
                                type="submit" 
                                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    <div className="divider">OR</div>
                    
                    <div className="text-center">
                        <p className="text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="link link-primary">
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