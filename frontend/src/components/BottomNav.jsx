import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, FileText, User, Plus } from 'lucide-react';

const BottomNav = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'text-primary-light' : 'text-gray-400';
    };

    return (
        <div className="fixed bottom-0 left-0 w-full bg-[#1a1f37]/95 backdrop-blur-lg border-t border-gray-800 p-4 pb-6 z-50 md:hidden flex justify-between items-center px-6">
            <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/')}`}>
                <LayoutDashboard size={24} />
                <span className="text-[10px]">Home</span>
            </Link>

            <Link to="/workouts" className={`flex flex-col items-center gap-1 ${isActive('/workouts')}`}>
                <Dumbbell size={24} />
                <span className="text-[10px]">Workouts</span>
            </Link>

            {/* Floating Action Button (FAB) */}
            <div className="relative -top-5">
                <Link to="/workouts" className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-4 shadow-lg shadow-purple-500/30 border-4 border-[#0f172a] flex items-center justify-center transform hover:scale-105 transition">
                    <Plus size={24} className="text-white" />
                </Link>
            </div>

            <Link to="/reports" className={`flex flex-col items-center gap-1 ${isActive('/reports')}`}>
                <FileText size={24} />
                <span className="text-[10px]">Reports</span>
            </Link>

            <Link to="/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile')}`}>
                <User size={24} />
                <span className="text-[10px]">Profile</span>
            </Link>
        </div>
    );
};

export default BottomNav;
