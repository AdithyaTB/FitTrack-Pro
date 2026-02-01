import { useState, useEffect, useContext, useMemo } from 'react';
import API from '../services/api';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    Plus, Trash2, Activity, Calendar, Clock, Flame,
    Filter, Search, Edit2, TrendingUp, BarChart2
} from 'lucide-react';

const Workouts = () => {
    const { user } = useContext(AuthContext);
    const { addToast } = useToast();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        type: 'Running',
        duration: '',
        caloriesBurned: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        intensity: '5',
        distance: '',
        steps: '',
        mood: 'Good'
    });

    // Filters
    const [filterType, setFilterType] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const workoutTypes = ['Running', 'Walking', 'Cycling', 'Strength', 'Yoga', 'HIIT', 'Pilates', 'Swimming', 'Other'];

    const fetchWorkouts = async () => {
        try {
            const { data } = await API.get('/workouts');
            setWorkouts(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching workouts', error);
            addToast('Failed to load workouts', 'error');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkouts();
    }, []);

    // Smart Calorie Estimation Effect
    useEffect(() => {
        if (!editMode && formData.duration && user?.currentWeight) {
            const mets = {
                'Cardio': 8, 'Strength': 5, 'Yoga': 3, 'HIIT': 9, 'Cycling': 7,
                'Running': 10, 'Walking': 3.5, 'Pilates': 3.5, 'Swimming': 7, 'Other': 5
            };
            const met = mets[formData.type] || 5;
            // Formula: (MET * 3.5 * weight / 200) * duration
            const estimated = Math.round((met * 3.5 * user.currentWeight / 200) * formData.duration);
            setFormData(prev => ({ ...prev, caloriesBurned: estimated }));
        }
    }, [formData.duration, formData.type, user, editMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await API.put(`/workouts/${editId}`, formData);
                addToast('Workout updated successfully', 'success');
            } else {
                await API.post('/workouts', formData);
                addToast('Workout logged successfully', 'success');
            }
            setFormData({ type: 'Running', duration: '', caloriesBurned: '', date: new Date().toISOString().split('T')[0], notes: '', intensity: '5' });
            setIsFormOpen(false);
            setEditMode(false);
            setEditId(null);
            fetchWorkouts();
        } catch (error) {
            addToast('Error saving workout', 'error');
        }
    };

    const handleEdit = (workout) => {
        setFormData({
            type: workout.type,
            duration: workout.duration,
            caloriesBurned: workout.caloriesBurned,
            date: workout.date ? workout.date.split('T')[0] : new Date().toISOString().split('T')[0],
            notes: workout.notes || '',
            intensity: workout.intensity || '5'
        });
        setEditId(workout._id);
        setEditMode(true);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this workout?')) {
            try {
                await API.delete(`/workouts/${id}`);
                addToast('Workout deleted', 'success');
                fetchWorkouts();
            } catch (error) {
                addToast('Error deleting workout', 'error');
            }
        }
    };

    // Summary Calculations
    const customSummary = useMemo(() => {
        if (!workouts.length) return null;
        const totalDuration = workouts.reduce((acc, curr) => acc + curr.duration, 0);
        const totalCalories = workouts.reduce((acc, curr) => acc + curr.caloriesBurned, 0);
        const avgDuration = Math.round(totalDuration / workouts.length);

        // Mode (Most Frequent)
        const typeCounts = workouts.reduce((acc, curr) => {
            acc[curr.type] = (acc[curr.type] || 0) + 1;
            return acc;
        }, {});
        const mostFreq = Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b);

        return { totalWorkouts: workouts.length, avgDuration, totalCalories, mostFreq };
    }, [workouts]);

    // Filter Logic
    const filteredWorkouts = workouts.filter(w => {
        const matchesType = filterType === 'All' || w.type === filterType;
        const matchesSearch = w.type.toLowerCase().includes(searchQuery.toLowerCase()) || (w.notes && w.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesType && matchesSearch;
    });

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-white">Workouts</h1>
                <button
                    onClick={() => { setIsFormOpen(!isFormOpen); setEditMode(false); setFormData({ type: 'Running', duration: '', caloriesBurned: '', date: new Date().toISOString().split('T')[0], notes: '', intensity: '5' }); }}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition transform hover:scale-105"
                >
                    <Plus size={20} /> {isFormOpen ? 'Cancel' : 'Log Workout'}
                </button>
            </div>

            {/* Workout Summary Card */}
            {customSummary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-xs uppercase tracking-wider">This Week</span>
                        <span className="text-2xl font-bold text-white">{customSummary.totalWorkouts} <span className="text-sm font-normal text-gray-500">sessions</span></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-xs uppercase tracking-wider">Avg Duration</span>
                        <span className="text-2xl font-bold text-blue-400">{customSummary.avgDuration} <span className="text-sm font-normal text-gray-500">mins</span></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-xs uppercase tracking-wider">Total Burn</span>
                        <span className="text-2xl font-bold text-orange-400">{customSummary.totalCalories} <span className="text-sm font-normal text-gray-500">kcal</span></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-xs uppercase tracking-wider">Favorite</span>
                        <span className="text-2xl font-bold text-purple-400">{customSummary.mostFreq}</span>
                    </div>
                </div>
            )}

            {/* Add/Edit Form */}
            {isFormOpen && (
                <div className="glass-card p-6 border border-indigo-500/30 animate-slide-in">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        {editMode ? <Edit2 className="text-indigo-400" /> : <Activity className="text-indigo-400" />}
                        {editMode ? 'Edit Workout' : 'Log a Workout'}
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="glass-input w-full [&>option]:bg-gray-900"
                            >
                                {workoutTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="glass-input w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Duration (mins)</label>
                            <input
                                type="number"
                                placeholder="30"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="glass-input w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Calories (Auto)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="Calculated automatically..."
                                    value={formData.caloriesBurned}
                                    onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
                                    className="glass-input w-full pl-10"
                                    required
                                />
                                <Flame className="absolute left-3 top-3 text-orange-500" size={16} />
                            </div>
                        </div>

                        {/* Intensity Slider */}
                        <div className="md:col-span-2">
                            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2 flex justify-between">
                                <span>Intensity Score</span>
                                <span className="text-indigo-400 font-bold">{formData.intensity}/10</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={formData.intensity}
                                onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Light</span>
                                <span>Moderate</span>
                                <span>Intense</span>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Notes (Optional)</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="glass-input w-full resize-none"
                                rows="2"
                                placeholder="How did it feel?"
                            />
                        </div>

                        {/* New Fields: Distance & Steps */}
                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Distance (km)</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={formData.distance || ''}
                                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                                className="glass-input w-full"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Steps</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={formData.steps || ''}
                                onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                                className="glass-input w-full"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Mood</label>
                            <div className="flex gap-2">
                                {['Great', 'Good', 'Okay', 'Tired', 'Exhausted'].map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, mood: m })}
                                        className={`px-4 py-2 rounded-lg text-sm transition border ${formData.mood === m ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2 flex gap-4 mt-2">
                            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-indigo-600/20">
                                {editMode ? 'Update Workout' : 'Save Workout'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search notes or types..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="glass-input w-full pl-10"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <Filter size={18} className="text-gray-400" />
                    <button
                        onClick={() => setFilterType('All')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${filterType === 'All' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                        All
                    </button>
                    {workoutTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${filterType === type ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Workouts List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : filteredWorkouts.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <Activity className="mx-auto mb-4 opacity-20" size={48} />
                        <p>No workouts found. Time to move!</p>
                    </div>
                ) : (
                    filteredWorkouts.map((workout) => (
                        <div key={workout._id} className="glass-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:bg-white/5 transition highlight-white/5">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg
                                    ${workout.type === 'Running' || workout.type === 'Cardio' ? 'bg-orange-500/10 text-orange-400 shadow-orange-500/10' :
                                        workout.type === 'Strength' ? 'bg-blue-500/10 text-blue-400 shadow-blue-500/10' :
                                            'bg-purple-500/10 text-purple-400 shadow-purple-500/10'}`}>
                                    {workout.type === 'Running' ? '🏃' :
                                        workout.type === 'Strength' ? '💪' :
                                            workout.type === 'Yoga' ? '🧘' :
                                                workout.type === 'Cycling' ? '🚴' : '🔥'}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">{workout.type}</h4>
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(workout.date).toLocaleDateString()}</span>
                                        <span className="hidden md:flex items-center gap-1"><Clock size={12} /> {workout.duration} min</span>
                                        <span className="flex items-center gap-1"><Flame size={12} /> {workout.caloriesBurned} kcal</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:items-end gap-1 w-full md:w-auto">
                                <div className="flex items-center gap-2 self-end">
                                    <span className={`text-xs px-2 py-1 rounded bg-gray-800 font-medium ${(workout.intensity || 5) >= 8 ? 'text-red-400' : (workout.intensity || 5) >= 5 ? 'text-yellow-400' : 'text-green-400'
                                        }`}>
                                        Intensity: {workout.intensity || 5}
                                    </span>
                                </div>
                                <div className="flex gap-2 self-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(workout)}
                                        className="p-2 hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-400 rounded-lg transition"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(workout._id)}
                                        className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Workouts;
