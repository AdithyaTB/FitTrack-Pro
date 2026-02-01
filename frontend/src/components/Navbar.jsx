import { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import { LogOut, User as UserIcon, Sun, Moon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <nav className="glass fixed w-full z-50 px-6 py-3 flex justify-between items-center text-white">
            <div className="text-2xl font-bold tracking-wide text-primary-light">
                <Link to="/">FITTRACK PRO</Link>
            </div>

            <div className="flex items-center space-x-6">
                <button
                    onClick={() => toggleTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
                </button>

                {user ? (
                    <>
                        <span className="hidden md:block">Welcome, {user.name}</span>
                        <Link to="/profile" className="p-2 rounded-full hover:bg-glass-medium transition-colors">
                            <UserIcon size={24} />
                        </Link>
                        <button onClick={logout} className="p-2 rounded-full hover:bg-red-500/50 transition-colors">
                            <LogOut size={24} />
                        </button>
                    </>
                ) : (
                    <div className="space-x-4">
                        <Link to="/login" className="hover:text-primary-light transition-colors">Login</Link>
                        <Link to="/register" className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg transition-all">
                            Get Started
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
