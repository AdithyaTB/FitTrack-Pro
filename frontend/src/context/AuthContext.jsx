import { createContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await API.post('/auth/login', { email, password });
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
        return res.data;
    };

    const register = async (userData) => {
        const res = await API.post('/auth/register', userData);
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const getUserProfile = async () => {
        const res = await API.get('/users/profile');
        localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), ...res.data }));
        setUser(res.data);
        return res.data;
    };

    const updateUserProfile = async (formData) => {
        const res = await API.put('/users/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
        return res.data;
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, getUserProfile, updateUserProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
