import { useNavigate, useRouteError } from 'react-router-dom';
import useAuth from '../Hooks/useAuth';
import { PrimaryButton, OutlineButton } from '../Components/Buttons';
import logo from '../assets/logo.png';

const ErrorPage = () => {
    const navigate = useNavigate();
    const error = useRouteError();
    const { user } = useAuth();

    const handleGoHome = () => {
        if (!user) {
            navigate('/');
        } else if (user.role?.type === 'customer') {
            navigate('/customer-home');
        } else if (user.role?.type === 'seller') {
            navigate('/seller-home');
        } else if (user.role?.type === 'admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full text-center">
                {/* Logo and Brand */}
                <div className="flex justify-center items-center space-x-3 mb-8">
                    <img 
                        src={logo} 
                        alt="BizNest Logo" 
                        className="h-16 w-16 object-contain"
                    />
                    <h1 className="text-4xl font-bold text-gray-900">
                        Biz<span className="text-amber-600">Nest</span>
                    </h1>
                </div>

                {/* Error Display */}
                <div className="card-biznest p-8 mb-8">
                    <div className="mb-6">
                        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Oops! Something went wrong
                        </h2>
                        
                        <h3 className="text-xl font-semibold text-gray-700 mb-6">
                            404 - Page Not Found
                        </h3>
                        
                        <p className="text-lg text-gray-600 mb-6">
                            Sorry, the page you are looking for doesn't exist or has been moved.
                        </p>
                    </div>

                    {/* Error Reasons */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6 text-left">
                        <h4 className="text-lg font-medium text-amber-800 mb-3">
                            This could happen for several reasons:
                        </h4>
                        <ul className="list-disc list-inside space-y-2 text-amber-700">
                            <li>The URL you entered might be incorrect</li>
                            <li>The page might have been deleted or moved</li>
                            <li>You might not have permission to access this page</li>
                            <li>There might be a temporary server issue</li>
                        </ul>
                    </div>

                    {/* Error Details */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="text-left">
                                <h3 className="text-sm font-medium text-red-800 mb-2">Error Details:</h3>
                                <div className="text-sm text-red-700 space-y-1">
                                    {error.status && (
                                        <p><span className="font-medium">Status:</span> {error.status} {error.statusText}</p>
                                    )}
                                    {error.message && (
                                        <p><span className="font-medium">Message:</span> {error.message}</p>
                                    )}
                                    {error.data && (
                                        <p><span className="font-medium">Details:</span> {error.data}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <PrimaryButton 
                            size="large"
                            onClick={handleGoHome}
                        >
                            {!user ? 'Go to Home' : 
                             user.role?.type === 'customer' ? 'Go to Customer Home' :
                             user.role?.type === 'seller' ? 'Go to Seller Home' :
                             'Go to Home'}
                        </PrimaryButton>
                        
                        <OutlineButton 
                            size="large"
                            onClick={() => window.history.back()}
                        >
                            Go Back
                        </OutlineButton>
                    </div>
                </div>

                {/* User Info */}
                {user && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-center">
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-amber-800">
                                    Logged in as <span className="font-medium">{user.username}</span> ({user.role?.type || 'User'})
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Help Section */}
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button 
                            onClick={() => navigate('/contact')} 
                            className="text-amber-600 hover:text-amber-500 font-medium transition-colors duration-200"
                        >
                            Contact Support
                        </button>
                        <span className="hidden sm:inline text-gray-300">•</span>
                        <button 
                            onClick={() => navigate('/help')} 
                            className="text-amber-600 hover:text-amber-500 font-medium transition-colors duration-200"
                        >
                            Help Center
                        </button>
                        <span className="hidden sm:inline text-gray-300">•</span>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="text-amber-600 hover:text-amber-500 font-medium transition-colors duration-200"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>

                {/* Support Message */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600 mb-2">
                        If you continue to experience issues, please contact our support team.
                    </p>
                    <div className="text-xs text-gray-500">
                        <p>Error occurred at: {new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;