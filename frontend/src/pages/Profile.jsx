import { useState, useContext, useEffect, useRef } from 'react';
import { Camera, Edit2, Medal, TrendingUp, Activity, Heart, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Profile = () => {
    const { user, getUserProfile, updateUserProfile } = useContext(AuthContext);
    const { addToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // File Refs
    const fileInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    // State
    const [profile, setProfile] = useState({
        name: '', email: '', age: '', height: '', currentWeight: '',
        targetWeight: '', goal: '', fitnessLevel: 'Beginner', activityLevel: 'Moderately Active',
        gender: 'Prefer not to say', bio: '', banner: '', profilePicture: ''
    });

    // File States
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreviewUrl, setBannerPreviewUrl] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getUserProfile();
                setProfile({
                    name: data.name || '',
                    email: data.email || '',
                    age: data.age || '',
                    height: data.height || '',
                    currentWeight: data.currentWeight || '',
                    targetWeight: data.targetWeight || '',
                    goal: data.goal || 'maintain',
                    fitnessLevel: data.fitnessLevel || 'Beginner',
                    gender: data.gender || 'Prefer not to say',
                    bio: data.bio || '',
                    banner: data.banner || '',
                    profilePicture: data.profilePicture || '',
                    activityLevel: data.activityLevel || 'Moderately Active'
                });
                setPreviewUrl(data.profilePicture || '');
                setBannerPreviewUrl(data.banner || '');
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerFile(file);
            setBannerPreviewUrl(URL.createObjectURL(file));
        }
    };

    const triggerFileInput = () => fileInputRef.current.click();
    const triggerBannerInput = () => bannerInputRef.current.click();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', profile.name);
            formData.append('email', profile.email);
            formData.append('age', profile.age);
            formData.append('gender', profile.gender);
            formData.append('height', profile.height);
            formData.append('currentWeight', profile.currentWeight);
            formData.append('targetWeight', profile.targetWeight);
            formData.append('goal', profile.goal);
            formData.append('bio', profile.bio);
            formData.append('fitnessLevel', profile.fitnessLevel);
            formData.append('activityLevel', profile.activityLevel);

            if (imageFile) {
                formData.append('profilePicture', imageFile);
            }

            if (bannerFile) {
                formData.append('banner', bannerFile);
            }

            // Note: We don't append existing URLs, backend keeps them if no new file is provided.

            await updateUserProfile(formData);

            addToast('Profile updated successfully!', 'success');
            setIsEditing(false);
            // Reset file states
            setImageFile(null);
            setBannerFile(null);
        } catch (error) {
            console.error(error);
            addToast('Failed to update profile.', 'error');
        }
    };

    // Calculations
    const heightInM = profile.height / 100;
    const bmi = (profile.currentWeight && heightInM) ? (profile.currentWeight / (heightInM * heightInM)).toFixed(1) : 'N/A';

    const getBMIStatus = (bmi) => {
        if (bmi === 'N/A') return { label: '-', color: 'text-gray-400' };
        if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
        if (bmi < 24.9) return { label: 'Healthy', color: 'text-green-400' };
        if (bmi < 29.9) return { label: 'Overweight', color: 'text-yellow-400' };
        return { label: 'Obese', color: 'text-red-400' };
    };

    const bmiStatus = getBMIStatus(bmi);
    const healthScore = bmi !== 'N/A' ? Math.min(100, Math.max(0, 100 - Math.abs(22 - bmi) * 2)) : 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            {/* Header / Banner */}
            <div className={`relative h-64 rounded-2xl overflow-hidden group ${bannerPreviewUrl ? '' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
                {bannerPreviewUrl && (
                    <img src={bannerPreviewUrl} alt="Banner" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition" />
                )}

                <div className="absolute inset-0 bg-black/30"></div>

                {/* Banner Edit Button */}
                {isEditing && (
                    <div className="absolute top-4 right-16 z-20">
                        <button
                            onClick={triggerBannerInput}
                            className="flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-md transition text-sm"
                        >
                            <ImageIcon size={16} /> Change Banner
                        </button>
                        <input
                            type="file"
                            ref={bannerInputRef}
                            onChange={handleBannerChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                )}

                <div className="absolute bottom-6 left-6 md:left-10 flex flex-col md:flex-row items-center md:items-end gap-6 w-full pr-12">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full bg-gray-900 border-4 border-gray-900 flex items-center justify-center text-4xl font-bold text-white overflow-hidden shadow-2xl relative">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                profile.name.charAt(0)
                            )}

                            {/* Overlay when hovering or editing */}
                            {isEditing && (
                                <div onClick={triggerFileInput} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                    <Upload className="text-white" size={24} />
                                </div>
                            )}
                        </div>

                        {/* Camera Button (Visible always in Edit Mode) */}
                        {isEditing && (
                            <button
                                onClick={triggerFileInput}
                                className="absolute bottom-2 right-2 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition shadow-lg z-20"
                            >
                                <Camera size={16} />
                            </button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    <div className="text-center md:text-left mb-2 flex-1">
                        <h1 className="text-3xl font-bold text-white drop-shadow-md">{profile.name}</h1>
                        <p className="text-indigo-200 drop-shadow-sm font-medium">@{profile.name.toLowerCase().replace(/\s/g, '')} • <span className="bg-white/20 px-2 py-0.5 rounded text-xs text-white">{profile.fitnessLevel}</span></p>
                        {profile.bio && <p className="text-gray-300 mt-2 max-w-lg text-sm italic">"{profile.bio}"</p>}
                    </div>

                    <div className="hidden md:block">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition backdrop-blur-md border ${isEditing ? 'bg-red-500/80 border-red-500 text-white hover:bg-red-600' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                        >
                            {isEditing ? <><X size={18} /> Cancel</> : <><Edit2 size={18} /> Edit Profile</>}
                        </button>
                    </div>
                </div>

                {/* Mobile Edit Button */}
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="md:hidden absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white backdrop-blur-md"
                >
                    {isEditing ? <X size={20} /> : <Edit2 size={20} />}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Stats & Health */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Health Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-6 border border-gray-700 bg-gray-900/50 rounded-xl relative overflow-hidden group hover:border-gray-600 transition">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 rounded-full group-hover:bg-green-500/20 transition blur-xl"></div>
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <p className="text-gray-400 text-sm font-medium">BMI Score</p>
                                    <h3 className="text-4xl font-bold text-white mt-2">{bmi}</h3>
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md mt-2 bg-white/5 border border-white/5 ${bmiStatus.color}`}>
                                        <div className={`w-2 h-2 rounded-full bg-current`}></div>
                                        <span className="text-xs font-semibold">{bmiStatus.label}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
                                    <Activity size={28} />
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6 border border-gray-700 bg-gray-900/50 rounded-xl relative overflow-hidden group hover:border-gray-600 transition">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition blur-xl"></div>
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <p className="text-gray-400 text-sm font-medium">Health Score</p>
                                    <h3 className="text-4xl font-bold text-white mt-2">{Math.round(healthScore)}<span className="text-xl text-gray-500">/100</span></h3>
                                    <p className="text-sm mt-2 text-blue-400 font-medium">Based on vitals</p>
                                </div>
                                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                                    <Heart size={28} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="glass-card p-6 border border-gray-700 bg-gray-900/50 rounded-xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Medal className="text-yellow-400" /> Achievements
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-yellow-500/50 transition cursor-pointer group">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center text-2xl shadow-lg shadow-orange-500/20 group-hover:scale-110 transition">
                                    🏆
                                </div>
                                <div className="text-center">
                                    <span className="text-sm font-bold text-gray-200 block">Starter</span>
                                    <span className="text-[10px] text-gray-500">First Workout</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-blue-500/50 transition cursor-pointer group">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition">
                                    🔥
                                </div>
                                <div className="text-center">
                                    <span className="text-sm font-bold text-gray-200 block">On Fire</span>
                                    <span className="text-[10px] text-gray-500">7 Day Streak</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-3 p-4 bg-gray-900 rounded-xl border border-gray-800 opacity-60 grayscale hover:grayscale-0 transition cursor-pointer">
                                <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-2xl">
                                    💪
                                </div>
                                <div className="text-center">
                                    <span className="text-sm font-bold text-gray-400 block">Pro Lifter</span>
                                    <span className="text-[10px] text-gray-600">Locked</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-3 p-4 bg-gray-900 rounded-xl border border-dashed border-gray-800 justify-center text-gray-600">
                                <span className="text-xs font-medium">+ See All</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Profile */}
                <div className={`glass-card p-6 border border-gray-700 bg-gray-900 rounded-xl h-fit transition-all ${isEditing ? 'ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/20' : ''}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Details</h3>
                        {/* Indicator if editing */}
                        {isEditing && <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold animate-pulse">Editing Mode</span>}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full bg-transparent border-b border-gray-700 py-1 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:border-transparent font-medium"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    onChange={handleChange}
                                    disabled={true} // Email is usually immutable for security
                                    className="w-full bg-transparent border-b border-gray-700 py-1 text-gray-400 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:border-transparent font-medium"
                                />
                            </div>
                        </div>

                        {/* Bio Field - New */}
                        <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Bio</label>
                            {isEditing ? (
                                <textarea
                                    name="bio"
                                    value={profile.bio}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 text-sm resize-none"
                                    placeholder="Tell us about yourself..."
                                />
                            ) : (
                                <p className="text-gray-300 text-sm min-h-[1.5rem]">{profile.bio || 'No bio added yet.'}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={profile.age}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full bg-transparent border-b border-gray-700 py-1 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:border-transparent font-medium"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Gender</label>
                                <select
                                    name="gender"
                                    value={profile.gender}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full bg-transparent border-b border-gray-700 py-1 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:border-transparent [&>option]:bg-gray-900 font-medium"
                                >
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                    <option>Prefer not to say</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Height (cm)</label>
                                <input
                                    type="number"
                                    name="height"
                                    value={profile.height}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full bg-transparent border-b border-gray-700 py-1 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:border-transparent font-medium"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Weight (kg)</label>
                                <input
                                    type="number"
                                    name="currentWeight"
                                    value={profile.currentWeight}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full bg-transparent border-b border-gray-700 py-1 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:border-transparent font-medium"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Target Weight (kg)</label>
                                <input
                                    type="number"
                                    name="targetWeight"
                                    value={profile.targetWeight}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full bg-transparent border-b border-gray-700 py-1 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:border-transparent font-medium"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Goal</label>
                                <select
                                    name="goal"
                                    value={profile.goal}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full bg-transparent border-b border-gray-700 py-1 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:border-transparent [&>option]:bg-gray-900 font-medium capitalize"
                                >
                                    <option value="lose">Lose Weight</option>
                                    <option value="gain">Gain Muscle</option>
                                    <option value="maintain">Maintain</option>
                                    <option value="build_muscle">Build Strength</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Fitness Level</label>
                                <select
                                    name="fitnessLevel"
                                    value={profile.fitnessLevel}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full bg-transparent border-b border-gray-700 py-1 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:border-transparent [&>option]:bg-gray-900 font-medium capitalize"
                                >
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Pro</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Activity Level</label>
                            <select
                                name="activityLevel"
                                value={profile.activityLevel}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full bg-transparent border-b border-gray-700 py-1 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:border-transparent [&>option]:bg-gray-900 font-medium capitalize"
                            >
                                <option>Sedentary</option>
                                <option>Lightly Active</option>
                                <option>Moderately Active</option>
                                <option>Very Active</option>
                                <option>Super Active</option>
                            </select>
                        </div>

                        {/* Banner Text Input Removed - now visual only */}

                        {isEditing && (
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-xl font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
