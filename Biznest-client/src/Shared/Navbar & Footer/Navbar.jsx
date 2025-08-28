import { Link } from 'react-router-dom';
import useAuth from '../../Hooks/useAuth';

const Navbar = () => {
    const { user, logOut } = useAuth();

    const handleLogout = async () => {
        try {
            await logOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="navbar bg-base-100 shadow-lg px-4">
            <div className="navbar-start">
                <Link to="/" className="btn btn-ghost text-xl">BizNest</Link>
            </div>
            
            <div className="navbar-end space-x-2">
                {user ? (
                    <div className="flex items-center space-x-4">
                        <div className="text-sm">
                            <span className="font-medium">{user.username}</span>
                            <span className="text-gray-500 ml-2">({user.role?.type})</span>
                        </div>
                        <button onClick={handleLogout} className="btn btn-outline btn-sm">
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="space-x-2">
                        <Link to="/login" className="btn btn-ghost btn-sm">
                            Login
                        </Link>
                        <Link to="/signup" className="btn btn-primary btn-sm">
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;