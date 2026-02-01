import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        age: '',
        height: '',
        weight: '',
        goal: 'maintain',
    });

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/');
        } catch (error) {
            alert('Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center pt-24 pb-10 px-4">
            <div className="glass-card p-8 w-full max-w-2xl">
                <h2 className="text-3xl font-bold mb-6 text-center text-white">Create Account</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                        <input
                            type="text"
                            name="name"
                            onChange={handleChange}
                            className="glass-input w-full"
                            placeholder="Full Name"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            onChange={handleChange}
                            className="glass-input w-full"
                            placeholder="Email Address"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            onChange={handleChange}
                            className="glass-input w-full"
                            placeholder="Password"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                        <input
                            type="number"
                            name="age"
                            onChange={handleChange}
                            className="glass-input w-full"
                            placeholder="Age"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Height (cm)</label>
                        <input
                            type="number"
                            name="height"
                            onChange={handleChange}
                            className="glass-input w-full"
                            placeholder="Height in cm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
                        <input
                            type="number"
                            name="weight"
                            onChange={handleChange}
                            className="glass-input w-full"
                            placeholder="Weight in kg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Goal</label>
                        <select
                            name="goal"
                            onChange={handleChange}
                            className="glass-input w-full bg-slate-900"
                        >
                            <option value="maintain">Maintain Weight</option>
                            <option value="lose">Lose Weight</option>
                            <option value="gain">Gain Muscle</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 mt-4">
                        <button type="submit" className="glass-btn w-full">
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
