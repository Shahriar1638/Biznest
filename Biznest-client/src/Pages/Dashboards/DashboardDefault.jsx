import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../Hooks/useAuth';

const DashboardDefault = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role?.type === 'seller') {
            navigate('/dashboard/seller/products');
        } else if (user?.role?.type === 'admin') {
            navigate('/dashboard/admin/products');
        } else {
            navigate('/profile');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
            </div>
        </div>
    );
};

export default DashboardDefault;
