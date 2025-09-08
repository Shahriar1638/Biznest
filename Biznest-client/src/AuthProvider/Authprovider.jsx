import { useState, useEffect } from "react";
import useAxiosPublic from "../Hooks/useAxiosPublic";
import { AuthContext } from "./AuthContext";
import { Navigate } from "react-router-dom";

const Authprovider = ({children}) => {
    const [ user, setUser ] = useState(null)
    const [ loading, setLoading ] = useState(true)
    const axiosPublic = useAxiosPublic();

    // Check for existing user session on component mount
    useEffect(() => {
        const checkAuthState = async () => {
            const token = localStorage.getItem('access-token');
            const savedUser = localStorage.getItem('user-info');
            
            if (token && savedUser) {
                try {
                    // Verify token is still valid
                    const response = await axiosPublic.get('/auth/verify-token', {
                        headers: {
                            authorization: `Bearer ${token}`
                        }
                    });
                    console.log(response)
                    if (response.data.valid) {
                        setUser(JSON.parse(savedUser));
                    } else {
                        // Token is invalid, clear storage
                        localStorage.removeItem('access-token');
                        localStorage.removeItem('user-info');
                    }
                } catch (error) {
                    // Token verification failed, clear storage
                    localStorage.removeItem('access-token');
                    localStorage.removeItem('user-info');
                    console.error('Token verification failed:', error);
                }
            }
            setLoading(false);
        };

        checkAuthState();
    }, [axiosPublic]);
    
    const login = async (userinfo) => {
        setLoading(true)
        return axiosPublic.post('/auth/login', userinfo)
            .then(res => {
                const userData = res.data.user;
                const token = res.data.token;
                
                // Store user info and token in localStorage
                localStorage.setItem('user-info', JSON.stringify(userData));
                localStorage.setItem('access-token', token);
                
                setUser(userData)
                setLoading(false)
                return userData
            })
            .catch(err => {
                setLoading(false)
                throw err
            })
    }
    const signupUser = async (userinfo) => {
        setLoading(true)
        console.log(userinfo)
        return axiosPublic.post('/auth/signup', userinfo)
            .then(res => {
                if (res.data.success) {
                    console.log(res.data.message);
                } else {
                    console.error('Unexpected response:', res.data);
                }
            })    
            .catch(err => {
                setLoading(false)
                throw err
            })
    }

    // Function to update user data in both state and localStorage
    const updateUser = (updatedUserData) => {
        setUser(updatedUserData);
        localStorage.setItem('user-info', JSON.stringify(updatedUserData));
    };

    const logOut = async () => {
        setLoading(true)
        return axiosPublic.post('/auth/logout')
            .then(() => {
                // Clear user info and token from localStorage
                localStorage.removeItem('user-info');
                localStorage.removeItem('access-token');
                
                setUser(null)
                setLoading(false)
                Navigate('/')
            })
            .catch(err => {
                // Even if logout fails on server, clear local storage
                localStorage.removeItem('user-info');
                localStorage.removeItem('access-token');
                setUser(null)
                setLoading(false)
                throw err
            })
    }

    const authInfo = { user, signupUser, login, logOut, loading, updateUser }
    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default Authprovider;