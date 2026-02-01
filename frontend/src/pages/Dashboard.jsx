import { useEffect, useState, useContext } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Activity, Flame, Scale, Trophy, Timer, Zap, TrendingUp } from 'lucide-react';
import API from '../services/api';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [workouts, setWorkouts] = useState([]);
    const [progress, setProgress] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [stats, setStats] = useState({
        totalWorkouts: 0,
        totalCalories: 0,
        currentWeight: 0,
        streak: 0,
        activeMinutes: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [workoutsRes, progressRes, analyticsRes] = await Promise.all([
                    API.get('/workouts'),
                    API.get('/progress'),
                    API.get('/progress/analytics')
                ]);

                setWorkouts(workoutsRes.data);
                setProgress(progressRes.data);
                setAnalytics(analyticsRes.data);

                // Calculate Stats
                const totalCalories = workoutsRes.data.reduce((acc, curr) => acc + curr.caloriesBurned, 0);
                const activeMinutes = workoutsRes.data.reduce((acc, curr) => acc + curr.duration, 0);
                const currentWeight = progressRes.data.length > 0 ? progressRes.data[progressRes.data.length - 1].weight : (user.currentWeight || user.weight);

                setStats({
                    totalWorkouts: workoutsRes.data.length,
                    totalCalories,
                    currentWeight,
                    // Use live streak from analytics if available, else fallback to user context
                    streak: analyticsRes.data.streak !== undefined ? analyticsRes.data.streak : (user.streak || 0),
                    activeMinutes
                });

            } catch (error) {
                console.error('Error fetching dashboard data', error);
            }
        };

        if (user) fetchData();
    }, [user]);

    // Chart Data Preparation
    const weightData = progress.map(p => ({
        date: new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        weight: p.weight
    }));

    const calorieData = [...workouts].reverse().slice(-7).map(w => ({
        date: new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        calories: w.caloriesBurned,
        type: w.type
    }));

    // Radar Data (Strength vs Cardio vs Flexibility)
    const normalizeType = (type) => {
        const t = (type || '').toLowerCase();
        if (t.includes('strength') || t.includes('lift') || t.includes('bodyweight')) return 'Strength';
        if (t.includes('run') || t.includes('cycling') || t.includes('hiit') || t.includes('cardio') || t.includes('walking')) return 'Cardio';
        if (t.includes('yoga') || t.includes('pilates') || t.includes('stretch')) return 'Mobility';
        return 'Other';
    };

    const radarRaw = { Strength: 0, Cardio: 0, Mobility: 0, Other: 0 };
    workouts.forEach(w => {
        const cat = normalizeType(w.type);
        radarRaw[cat] += w.duration;
    });
    const radarData = Object.keys(radarRaw).map(key => ({ subject: key, A: radarRaw[key], fullMark: 150 }));

    // Pie Data (Distribution)
    const pieRaw = {};
    workouts.forEach(w => {
        pieRaw[w.type] = (pieRaw[w.type] || 0) + 1;
    });
    const pieData = Object.keys(pieRaw).map(key => ({ name: key, value: pieRaw[key] }));
    const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];


    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                            Welcome back, {user?.name} 👋
                        </h1>
                        {analytics?.thisWeek?.workouts > 0 && (
                            <div className="px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center gap-1 mb-2">
                                <TrendingUp size={12} className="text-green-400" />
                                <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Active Today</span>
                            </div>
                        )}
                    </div>
                    <p className="text-gray-400">Your fitness journey at a glance.</p>
                </div>
                <div className="glass-card px-4 py-2 flex items-center gap-2 border border-orange-500/30">
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500 font-medium">STREAK</span>
                        <span className="text-xl font-bold text-orange-500">🔥 {stats.streak}</span>
                    </div>
                </div>
            </div>

            {/* Insight Banner */}
            {analytics?.insights?.length > 0 && (
                <div className="bg-indigo-900/30 border border-indigo-500/30 p-4 rounded-xl flex items-center gap-3">
                    <Zap className="text-yellow-400" />
                    <p className="text-indigo-200">{analytics.insights[0]}</p>
                </div>
            )}

            {/* Missions / Next Steps */}
            {analytics?.nextMissions?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analytics.nextMissions.map((mission) => (
                        <div key={mission.id} className="glass-card p-4 border border-gray-700 bg-gray-900/50 rounded-xl flex items-center gap-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full pointer-events-none"></div>
                            <div className="text-2xl">{mission.icon}</div>
                            <div>
                                <h4 className="font-bold text-gray-200 text-sm">{mission.title}</h4>
                                <p className="text-xs text-gray-400">{mission.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Weekly Progress & Goals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 border border-gray-700 bg-gray-900 rounded-xl">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-gray-400 text-sm">Weekly Workout Goal</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                {analytics?.thisWeek?.workouts || 0} <span className="text-gray-500 text-lg">/ 5</span>
                            </h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Trophy className="text-blue-400" size={24} />
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(((analytics?.thisWeek?.workouts || 0) / 5) * 100, 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        {analytics?.thisWeek?.workouts >= 5 ? 'Goal Reached! 🎉' : `${5 - (analytics?.thisWeek?.workouts || 0)} more to go!`}
                    </p>
                </div>

                <div className="glass-card p-6 border border-gray-700 bg-gray-900 rounded-xl">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-gray-400 text-sm">Weekly Calorie Goal</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                {analytics?.thisWeek?.calories || 0} <span className="text-gray-500 text-lg">/ 2500</span>
                            </h3>
                        </div>
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Flame className="text-orange-400" size={24} />
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(((analytics?.thisWeek?.calories || 0) / 2500) * 100, 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        {((analytics?.thisWeek?.calories || 0) / 2500) * 100 >= 100 ? 'On Fire! 🔥' : `${Math.round((analytics?.thisWeek?.calories || 0) / 2500 * 100)}% of weekly target`}
                    </p>
                </div>
            </div>

            {/* Stats Grid - Swipeable on Mobile */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:pb-0 scrollbar-hide">
                <div className="min-w-[85%] md:min-w-0 snap-center">
                    <StatCard icon={<Timer className="text-blue-400" />} title="Active Minutes" value={stats.activeMinutes} unit="mins" color="bg-blue-500/10" />
                </div>
                <div className="min-w-[85%] md:min-w-0 snap-center">
                    <StatCard icon={<Flame className="text-orange-400" />} title="Total Burn" value={stats.totalCalories} unit="kcal" color="bg-orange-500/10" />
                </div>
                <div className="min-w-[85%] md:min-w-0 snap-center">
                    <StatCard icon={<Activity className="text-purple-400" />} title="Workouts" value={stats.totalWorkouts} unit="sessions" color="bg-purple-500/10" />
                </div>
                <div className="min-w-[85%] md:min-w-0 snap-center">
                    <StatCard icon={<Scale className="text-green-400" />} title="Current Weight" value={stats.currentWeight} unit="kg" color="bg-green-500/10" />
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard title="Weight Trend">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weightData}>
                            <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" domain={['dataMin - 2', 'dataMax + 2']} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                            <Area type="monotone" dataKey="weight" stroke="#818cf8" fillOpacity={1} fill="url(#colorWeight)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Activity Volume (Calories)">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={calorieData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip cursor={{ fill: '#374151' }} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                            <Bar dataKey="calories" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 glass-card p-6 border border-gray-700 bg-gray-900 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-6">Workout Balance</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#4b5563" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                <Radar name="Duration" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-2 glass-card p-6 border border-gray-700 bg-gray-900 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-6">Category Distribution</h3>
                    <div className="h-64 w-full flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        </div>

    );
};

const StatCard = ({ icon, title, value, unit, color }) => (
    <div className="glass-card p-6 flex items-center gap-4 border border-gray-700 bg-gray-900 rounded-xl hover:scale-105 transition-transform duration-200">
        <div className={`p-4 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value} <span className="text-sm font-normal text-gray-500">{unit}</span></p>
        </div>
    </div>
);

const ChartCard = ({ title, children }) => (
    <div className="glass-card p-6 border border-gray-700 bg-gray-900 rounded-xl">
        <h3 className="text-xl font-bold text-white mb-6">{title}</h3>
        <div className="h-64 w-full">
            {children}
        </div>
    </div>
);

export default Dashboard;
