import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import { LogOut, User as UserIcon, Sun, Moon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const location = useLocation();

    const isLoginPage = location.pathname === '/login';
    const isRegisterPage = location.pathname === '/register';

    return (
        <nav className="glass fixed w-full z-50 px-4 md:px-6 py-3 flex justify-between items-center text-white">
            <div className="text-xl md:text-2xl font-bold tracking-wide text-primary-light whitespace-nowrap">
                <Link to="/">FITTRACK PRO</Link>
            </div>

            <div className="flex items-center space-x-3 md:space-x-6">
                <button
                    onClick={() => toggleTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-1.5 md:p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
                </button>

                {user ? (
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <span className="hidden md:block">Welcome, {user.name}</span>
                        <Link to="/profile" className="p-2 rounded-full hover:bg-glass-medium transition-colors">
                            <UserIcon size={20} className="md:w-6 md:h-6" />
                        </Link>
                        <button onClick={logout} className="p-2 rounded-full hover:bg-red-500/50 transition-colors">
                            <LogOut size={20} className="md:w-6 md:h-6" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-3 md:space-x-4">
                        {!isLoginPage && (
                            <Link to="/login" className="text-sm md:text-base hover:text-primary-light transition-colors">
                                Login
                            </Link>
                        )}
                        {!isRegisterPage && (
                            <Link to="/register" className="bg-primary hover:bg-primary-dark px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base transition-all">
                                Get Started
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
