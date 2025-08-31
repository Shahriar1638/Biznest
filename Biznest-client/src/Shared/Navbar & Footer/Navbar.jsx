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
        <div>
            <div>
                <Link to="/">BizNest</Link>
            </div>
            
            <div>
                {user ? (
                    <div>
                        <div>
                            <span>{user.username}</span>
                            <span>({user.role?.type})</span>
                        </div>
                        <button onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <div>
                        <Link to="/login">
                            Login
                        </Link>
                        <Link to="/signup">
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;