import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, FileText, User } from 'lucide-react';

const Sidebar = () => {
    const links = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Workouts', path: '/workouts', icon: <Dumbbell size={20} /> },
        { name: 'Reports', path: '/reports', icon: <FileText size={20} /> },
        { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    ];

    return (
        <div className="hidden md:flex flex-col w-64 h-screen fixed pt-20 pl-4 pr-4 bg-transparent border-r border-white/10">
            <div className="flex flex-col space-y-2">
                {links.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.path}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        {link.icon}
                        <span className="font-medium">{link.name}</span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
