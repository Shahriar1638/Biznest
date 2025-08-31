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
        <div>
            <div>
                <div>
                    <h2>Join BizNest</h2>
                    
                    {error && (
                        <div>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div>
                            {/* Email */}
                            <div>
                                <label>
                                    <span>Email</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            {/* Username */}
                            <div>
                                <label>
                                    <span>Username</span>
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Choose a username"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label>
                                    <span>Password</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label>
                                    <span>Confirm Password</span>
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    required
                                />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label>
                                    <span>Phone Number</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="123-456-7890"
                                    required
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <label>
                                    <span>Gender</span>
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>

                            {/* Role Type */}
                            <div>
                                <label>
                                    <span>Account Type</span>
                                </label>
                                <select
                                    name="roleType"
                                    value={formData.role.type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="customer">Customer</option>
                                    <option value="seller">Seller</option>
                                </select>
                            </div>

                            {/* Profile URL */}
                            <div>
                                <label>
                                    <span>Profile Image URL</span>
                                </label>
                                <input
                                    type="url"
                                    name="profileurl"
                                    value={formData.profileurl}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label>
                                <span>Address</span>
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter your full address"
                                rows="3"
                                required
                            />
                        </div>

                        {/* Role-specific information display */}
                        <div>
                            <div>
                                <h3>Account Type: {formData.role.type}</h3>
                                <div>
                                    {formData.role.type === 'customer' && (
                                        <p>As a customer, you can browse and purchase products from our marketplace.</p>
                                    )}
                                    {formData.role.type === 'seller' && (
                                        <p>As a seller, you can list and sell your products on our marketplace.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    <div>OR</div>
                    
                    <div>
                        <p>
                            Already have an account?{' '}
                            <Link to="/login">
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