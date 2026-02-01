import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (error) {
            alert('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center pt-20 px-4">
            <div className="glass-card p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-white">Welcome Back</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="glass-input w-full"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="glass-input w-full"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button type="submit" className="glass-btn w-full">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
