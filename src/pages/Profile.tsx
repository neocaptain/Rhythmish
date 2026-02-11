import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface ProfileProps {
    onBack: () => void;
}

const Profile: React.FC<ProfileProps> = () => {
    const [favoriteCount, setFavoriteCount] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            const user = auth.currentUser;
            if (!user) return;

            const q = query(collection(db, "liked_songs"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            setFavoriteCount(querySnapshot.size);
        };
        fetchStats();
    }, []);

    const calendarDays = [
        { day: 28, emoji: null, color: null }, { day: 29, emoji: null, color: null }, { day: 30, emoji: null, color: null },
        { day: 1, emoji: '🔥', color: 'bg-orange-400' }, { day: 2, emoji: '🌊', color: 'bg-blue-400' },
        { day: 3, emoji: '✨', color: 'bg-primary' }, { day: 4, emoji: '✨', color: 'bg-primary' },
        { day: 5, emoji: '🌿', color: 'bg-emerald-400' }, { day: 6, emoji: '🌿', color: 'bg-emerald-400' },
        { day: 7, emoji: '🔥', color: 'bg-orange-400' }, { day: 8, emoji: '🔥', color: 'bg-orange-400' },
        { day: 9, emoji: '🌊', color: 'bg-blue-400' }, { day: 10, emoji: '💖', color: 'bg-pink-400' },
        { day: 11, emoji: '💖', color: 'bg-pink-400' }, { day: 12, emoji: '✨', color: 'bg-primary' },
        { day: 13, emoji: '🌿', color: 'bg-emerald-400' }, { day: 14, emoji: '🌿', color: 'bg-emerald-400' },
        { day: 15, emoji: '🔥', color: 'bg-orange-400' }, { day: 16, emoji: '🔥', color: 'bg-orange-400' },
        { day: 17, emoji: '✨', color: 'bg-primary', active: true }, { day: 18, emoji: null, color: 'bg-slate-700' },
        { day: 19, emoji: null, color: 'bg-slate-700' }, { day: 20, emoji: null, color: 'bg-slate-700' },
        { day: 21, emoji: null, color: 'bg-slate-700' }, { day: 22, emoji: null, color: 'bg-slate-700' },
        { day: 23, emoji: null, color: 'bg-slate-700' }, { day: 24, emoji: null, color: 'bg-slate-700' },
    ];

    const vibeStats = [
        { label: "Energetic", value: 70, color: "bg-primary" },
        { label: "Calm & Lo-Fi", value: 22, color: "bg-emerald-400" },
        { label: "Melancholic", value: 8, color: "bg-blue-400" },
    ];

    const badges = [
        { label: "First Analysis", icon: "insights", grad: "from-primary to-purple-400" },
        { label: "10 Favorites", icon: "favorite", grad: "from-orange-400 to-yellow-300", locked: favoriteCount < 10 },
        { label: "Night Owl", icon: "nights_stay", grad: "from-emerald-400 to-cyan-400" },
        { label: "Trendsetter", icon: "lock", locked: true },
        { label: "Explorer", icon: "lock", locked: true },
    ];

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display overflow-y-auto no-scrollbar pb-32">
            <div className="h-4 w-full shrink-0"></div>
            <main className="max-w-md mx-auto px-6">
                {/* Profile Header */}
                <header className="flex flex-col items-center mt-4 mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
                        <img
                            alt="User Profile"
                            className="relative w-24 h-24 rounded-full border-2 border-primary object-cover"
                            src={auth.currentUser?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuASwRYiETk6H-n_QDaoDgVFZ1_6dz9mCfnXA6S80oU3_ndVpsclDESkjj1ckQvWixtHshVBqzw5NjPTPC-vfpnfWL4d_EH6GuqFaGTQNzl9d_G7UYsbIDbceux_nr3NhLa5AgmMVP8SQNdwsNEzZkTAQOmw7aU04JxtfwkaWf5Lh3S6aVMqSX__cpzKHKXmee3W3suGnDDRTO1suY5fpEiNJGfmubNA6i4q1cGFhfFX583k1_yAVCxlpkJdpJliKBZDMd2-xPojrW9i"}
                        />
                        <div className="absolute bottom-0 right-0 bg-primary p-1.5 rounded-full border-2 border-background-dark">
                            <span className="material-symbols-outlined text-white text-[12px] fill-1">verified</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold mt-4 tracking-tight">{auth.currentUser?.displayName || "Alex Rivera"}</h1>
                    <p className="text-primary/70 text-sm font-medium">Sonic Explorer • Level 12</p>
                </header>

                {/* Emotion Calendar Section */}
                <section className="mb-8">
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-lg font-bold">Emotion Calendar</h2>
                        <span className="text-xs text-slate-400">October 2025</span>
                    </div>
                    <div className="bg-primary/5 dark:bg-white/5 backdrop-blur-md border border-primary/10 p-5 rounded-3xl">
                        <div className="grid grid-cols-7 gap-3 mb-4 text-center">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                                <span key={i} className="text-[10px] uppercase font-bold text-slate-500">{d}</span>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-3">
                            {calendarDays.map((d, i) => (
                                <div
                                    key={i}
                                    className={`aspect-square flex items-center justify-center text-[10px] rounded-full transition-all duration-300 ${d.color || 'text-slate-500'} ${d.active ? 'ring-2 ring-white ring-offset-2 ring-offset-background-dark shadow-lg shadow-primary/40' : ''}`}
                                >
                                    {d.emoji || d.day}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Monthly Vibe Summary */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold mb-4">This Month's Vibe</h2>
                    <div className="bg-primary/5 dark:bg-white/5 backdrop-blur-md border border-primary/10 p-6 rounded-3xl">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium">Dominant: <span className="text-primary font-bold">Energetic</span></span>
                            <span className="text-xs text-slate-400 italic">Analysis of {favoriteCount * 5 + 142} songs</span>
                        </div>
                        <div className="space-y-4">
                            {vibeStats.map((v, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs mb-1.5 font-semibold">
                                        <span>{v.label}</span>
                                        <span className="font-bold">{v.value}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${v.value}%` }}
                                            transition={{ duration: 1, delay: i * 0.2 }}
                                            className={`h-full ${v.color} rounded-full`}
                                        ></motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95">
                            <span className="material-symbols-outlined text-sm">share</span>
                            Share Insights
                        </button>
                    </div>
                </section>

                {/* Badges & Achievements */}
                <section className="mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">Achievements</h2>
                        <button className="text-primary text-xs font-bold uppercase tracking-wider">View All</button>
                    </div>
                    <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
                        {badges.map((b, i) => (
                            <div key={i} className={`flex flex-col items-center flex-shrink-0 transition-opacity duration-500 ${b.locked ? 'opacity-30' : 'opacity-100'}`}>
                                <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${b.grad || 'from-slate-600 to-slate-400'} p-[2px] mb-2 shadow-lg`}>
                                    <div className="w-full h-full rounded-full bg-background-light dark:bg-background-dark flex items-center justify-center">
                                        <span className={`material-symbols-outlined text-2xl ${b.locked ? 'text-slate-500' : 'text-primary'}`}>{b.locked ? 'lock' : b.icon}</span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-300 text-center w-20">{b.label}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Profile;
