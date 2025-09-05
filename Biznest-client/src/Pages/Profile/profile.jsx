import { useState } from 'react';
import useAuth from '../../Hooks/useAuth';
import { AdminInfo, CustomerInfo, SellerInfo } from './UniqueInfos';
import { PrimaryButton, SecondaryButton } from '../../Components/Buttons';
import PaymentHistory from './Extra infos/PaymentHistory';

const Profile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState(user || {});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        // Here you would typically make an API call to update user data
        console.log('Saving user data:', editedUser);
        setIsEditing(false);
        // Update the user context with new data
    };

    const handleCancel = () => {
        setEditedUser(user || {});
        setIsEditing(false);
    };

    const renderUniqueInfo = () => {
        if (!user?.role) return null;

        switch (user.role.type) {
            case 'admin':
                return <AdminInfo roleDetails={user.role.details} />;
            case 'customer':
                return <CustomerInfo roleDetails={user.role.details} />;
            case 'seller':
                return <SellerInfo roleDetails={user.role.details} />;
            default:
                return null;
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Please log in to view your profile</h2>
                    <p className="text-gray-600">You need to be logged in to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
                    <p className="text-gray-600">Manage your account information and preferences</p>
                </div>

                {/* Account Status Alert */}
                {user.ban_status && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-red-800">
                                <span className="font-medium">Account Restricted:</span> Your account has been temporarily restricted. Please contact support for assistance.
                            </p>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Common User Information */}
                    <div className="card-biznest p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                                    {user.profileurl ? (
                                        <img 
                                            src={user.profileurl} 
                                            alt="Profile" 
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xl font-semibold text-amber-600">
                                            {user.username?.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-900">{user.username}</h2>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 capitalize">
                                        {user.role?.type || 'User'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex space-x-3">
                                {isEditing ? (
                                    <>
                                        <SecondaryButton onClick={handleCancel} size="small">
                                            Cancel
                                        </SecondaryButton>
                                        <PrimaryButton onClick={handleSave} size="small">
                                            Save Changes
                                        </PrimaryButton>
                                    </>
                                ) : (
                                    <SecondaryButton onClick={() => setIsEditing(true)} size="small">
                                        Edit Profile
                                    </SecondaryButton>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Email Address</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={editedUser.email || ''}
                                        onChange={handleInputChange}
                                        className="input-biznest"
                                    />
                                ) : (
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Phone Number</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={editedUser.phone_number || ''}
                                        onChange={handleInputChange}
                                        className="input-biznest"
                                    />
                                ) : (
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user.phone_number}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Gender</label>
                                {isEditing ? (
                                    <select
                                        name="gender"
                                        value={editedUser.gender || ''}
                                        onChange={handleInputChange}
                                        className="input-biznest"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer-not-to-say">Prefer not to say</option>
                                    </select>
                                ) : (
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg capitalize">{user.gender || 'Not specified'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Account Status</label>
                                <p className={`text-gray-900 bg-gray-50 p-3 rounded-lg font-medium ${user.ban_status ? 'text-red-600' : 'text-green-600'}`}>
                                    {user.ban_status ? 'Restricted' : 'Active'}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-2">Address</label>
                                {isEditing ? (
                                    <textarea
                                        name="address"
                                        value={editedUser.address || ''}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="input-biznest"
                                    />
                                ) : (
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user.address}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Role-Specific Information */}
                    {renderUniqueInfo()}

                    {/* Payment History - Only for Customers */}
                    {user.role?.type === 'customer' && (
                        <PaymentHistory />
                    )}

                    {/* Action Buttons */}
                    <div className="card-biznest p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
                        <div className="flex flex-wrap gap-4">
                            <SecondaryButton>
                                Change Password
                            </SecondaryButton>
                            <SecondaryButton>
                                Privacy Settings
                            </SecondaryButton>
                            <SecondaryButton className="hover:bg-red-50 hover:text-red-600 hover:border-red-300">
                                Delete Account
                            </SecondaryButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;