import useAuth from '../Hooks/useAuth';
import useAxiosPublic from '../Hooks/useAxiosPublic';

const AuthDebug = () => {
    const { user, loading } = useAuth();
    const axiosPublic = useAxiosPublic();

    const testConnection = async () => {
        try {
            console.log('Testing connection to:', axiosPublic.defaults.baseURL);
            const response = await axiosPublic.get('/auth/test');
            console.log('Connection test response:', response.data);
        } catch (error) {
            console.error('Connection test failed:', error.message);
            console.error('Error details:', error.response?.data);
        }
    };

    const testTokenVerification = async () => {
        const token = localStorage.getItem('access-token');
        if (!token) {
            console.log('No token found in localStorage');
            return;
        }

        try {
            console.log('Testing token verification...');
            const response = await axiosPublic.get('/auth/verify-token', {
                headers: {
                    authorization: `Bearer ${token}`
                }
            });
            console.log('Token verification response:', response.data);
        } catch (error) {
            console.error('Token verification test failed:', error.message);
            console.error('Error details:', error.response?.data);
        }
    };

    if (loading) {
        return <div className="p-4">Loading auth state...</div>;
    }

    return (
        <div className="p-4 bg-base-200 rounded-lg m-4">
            <h3 className="text-lg font-bold mb-4">Auth Debug Panel</h3>
            
            <div className="space-y-2 mb-4">
                <p><strong>User:</strong> {user ? `${user.username} (${user.role?.type})` : 'Not logged in'}</p>
                <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                <p><strong>Token:</strong> {localStorage.getItem('access-token') ? 'Present' : 'Not found'}</p>
                <p><strong>Saved User:</strong> {localStorage.getItem('user-info') ? 'Present' : 'Not found'}</p>
                <p><strong>API Base URL:</strong> {axiosPublic.defaults.baseURL}</p>
            </div>

            <div className="space-x-2">
                <button 
                    onClick={testConnection}
                    className="btn btn-sm btn-outline"
                >
                    Test Connection
                </button>
                <button 
                    onClick={testTokenVerification}
                    className="btn btn-sm btn-outline"
                >
                    Test Token Verification
                </button>
            </div>
        </div>
    );
};

export default AuthDebug;
