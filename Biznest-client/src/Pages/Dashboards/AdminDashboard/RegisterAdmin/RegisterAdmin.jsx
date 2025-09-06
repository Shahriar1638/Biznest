import { useState } from 'react';
import useAxiosSecure from '../../../../Hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const RegisterAdmin = () => {
    const axiosSecure = useAxiosSecure();
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone_number: '',
        gender: '',
        address: '',
        profileurl: '',
        role: {
            type: 'admin',
            details: {
                salary: 0
            }
        },
        ban_status: false
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'salary') {
            setFormData(prev => ({
                ...prev,
                role: {
                    ...prev.role,
                    details: {
                        ...prev.role.details,
                        salary: parseFloat(value) || 0
                    }
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate passwords match
            if (formData.password !== formData.confirmPassword) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Passwords do not match',
                    confirmButtonColor: '#f59e0b'
                });
                setLoading(false);
                return;
            }

            // Validate password length
            if (formData.password.length < 6) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Password must be at least 6 characters long',
                    confirmButtonColor: '#f59e0b'
                });
                setLoading(false);
                return;
            }

            // Remove confirmPassword from the data to send
            // eslint-disable-next-line no-unused-vars
            const { confirmPassword, ...adminData } = formData;

            // Send to API
            const response = await axiosSecure.post('/auth/adminregister', adminData);
            
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Admin registered successfully!',
                    confirmButtonColor: '#f59e0b'
                });
                
                // Reset form
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    phone_number: '',
                    gender: '',
                    address: '',
                    profileurl: '',
                    role: {
                        type: 'admin',
                        details: {
                            salary: 0
                        }
                    },
                    ban_status: false
                });
            }
        } catch (error) {
            console.error('Error registering admin:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to register admin',
                confirmButtonColor: '#f59e0b'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Register New Admin</h1>
                    <p className="text-gray-600">Create a new administrator account</p>
                </div>

                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Username *
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                                    placeholder="Enter username"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                                    placeholder="Enter email address"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    minLength="6"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                                    placeholder="Enter password (min 6 characters)"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password *
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                                    placeholder="Confirm password"
                                />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black bg-white"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                </select>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                                    placeholder="Enter address"
                                />
                            </div>

                            {/* Profile Image URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Profile Image URL
                                </label>
                                <input
                                    type="url"
                                    name="profileurl"
                                    value={formData.profileurl}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                                    placeholder="https://example.com/image.jpg"
                                />
                                {formData.profileurl && (
                                    <div className="mt-2">
                                        <img 
                                            src={formData.profileurl} 
                                            alt="Profile Preview" 
                                            className="w-20 h-20 object-cover rounded-full border"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Salary */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Salary (BDT)
                                </label>
                                <input
                                    type="number"
                                    name="salary"
                                    value={formData.role.details.salary}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                                    placeholder="Enter salary amount"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({
                                            username: '',
                                            email: '',
                                            password: '',
                                            confirmPassword: '',
                                            phone_number: '',
                                            gender: '',
                                            address: '',
                                            profileurl: '',
                                            role: {
                                                type: 'admin',
                                                details: {
                                                    salary: 0
                                                }
                                            },
                                            ban_status: false
                                        });
                                    }}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Clear Form
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Registering Admin...' : 'Register Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterAdmin;