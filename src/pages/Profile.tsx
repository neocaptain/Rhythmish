import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '../services/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { MOOD_DICTIONARY } from '../constants/moods';

const Profile: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const user = auth.currentUser;
    const [stats, setStats] = useState({
        totalAnalyses: 0,
        topMood: 'Peaceful',
        likedCount: 0,
        playlistCount: 0
    });
    const [recentHistory, setRecentHistory] = useState<any[]>([]);
    const [sinceYear, setSinceYear] = useState<number | string>("...."); // add sinceYear state

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;

            try {
                // 1. get a oldest mood history document
                const sinceQ = query(
                    collection(db, "mood_history"),
                    where("userId", "==", user.uid),
                    orderBy("createdAt", "asc"), // 오름차순 (가장 오래된 것부터)
                    limit(1)
                );

                // 2. Fetch Stats (History, Likes, Playlists)
                const historyQ = query(collection(db, "mood_history"), where("userId", "==", user.uid));
                const likesQ = query(collection(db, "liked_songs"), where("userId", "==", user.uid));
                const playlistQ = query(collection(db, "user_playlists"), where("userId", "==", user.uid));

                const [sinceSnap, historySnap, likesSnap, playlistSnap] = await Promise.all([
                    getDocs(sinceQ), getDocs(historyQ), getDocs(likesQ), getDocs(playlistQ)
                ]);

                // extract the year of the oldest mood history document
                if (!sinceSnap.empty) {
                    const firstDate = sinceSnap.docs[0].data().createdAt?.toDate();
                    if (firstDate) {
                        setSinceYear(firstDate.getFullYear());
                    }
                } else {
                    setSinceYear(new Date().getFullYear());
                }

                // 2. Simple Mood Analysis (Count most frequent mood)
                const moodCounts: Record<string, number> = {};
                historySnap.docs.forEach(doc => {
                    const mood = doc.data().userMood[0].emotion;
                    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
                });
                const topMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b, 'Peaceful');

                setStats({
                    totalAnalyses: historySnap.size,
                    topMood: topMood,
                    likedCount: likesSnap.size,
                    playlistCount: playlistSnap.size
                });

                // 3. Fetch Recent History for Timeline
                const recentQ = query(
                    collection(db, "mood_history"),
                    where("userId", "==", user.uid),
                    orderBy("createdAt", "desc"),
                    limit(5)
                );
                const recentSnap = await getDocs(recentQ);
                setRecentHistory(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        };

        fetchUserData();
    }, [user]);

    return (
        <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar pb-24">
            {/* Header Area */}
            <header className="px-6 pt-12 pb-8 text-center relative overflow-hidden">
                {/* 1. Added Back Button to use 'onBack' */}
                <button
                    onClick={onBack}
                    className="absolute top-10 left-6 size-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors z-20"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 blur-[100px] -z-10 rounded-full" />

                {/* Profile Image & Badge */}
                <div className="relative inline-block mb-4 mt-4">
                    <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden mx-auto">
                        <img src={user?.photoURL || ''} alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg">
                        <span className="material-symbols-outlined text-white text-sm fill-1">auto_awesome</span>
                    </div>
                </div>

                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                    {user?.displayName}'s Rhythm
                </h1>
                <p className="text-sm text-slate-500 font-medium">Tracking your soul since {sinceYear}</p>
            </header>

            {/* Insight Card: Current Vibe */}
            <section className="px-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-3xl p-6 border-t border-white/20 shadow-xl overflow-hidden relative"
                >
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">Core Emotion</p>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-5xl">{MOOD_DICTIONARY[stats.topMood]?.emoji || '🌿'}</span>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                    Mainly <span className={MOOD_DICTIONARY[stats.topMood]?.color}>{stats.topMood}</span>
                                </h2>
                                <p className="text-sm text-slate-500">Based on your last {stats.totalAnalyses} records</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Quick Stats Grid */}
            <section className="px-6 grid grid-cols-2 gap-4 mb-8">
                <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-primary">{stats.likedCount}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Likes</span>
                </div>
                <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-primary">{stats.playlistCount}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Playlist</span>
                </div>
            </section>

            {/* Emotional Journey (Timeline) */}
            <section className="px-6 mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 px-1">Emotional Journey</h3>
                <div className="space-y-6 relative">
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200 dark:bg-white/5" />

                    {recentHistory.map((item, idx) => {
                        // Determine the preview text for the timeline
                        const getPreviewText = () => {
                            if (item.userInputText && item.userInputText.trim() !== "") {
                                return `"${item.userInputText.slice(0, 40)}${item.userInputText.length > 40 ? '...' : ''}"`;
                            }

                            // Fallback messages based on input type or analysis headline
                            if (item.inputType === "camera" || item.inputType === "gallery") {
                                return item.headline ? `📸 ${item.headline}` : "🖼️ Captured a visual moment";
                            }

                            return "✨ Recorded a silent mood";
                        };

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex gap-6 relative"
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-lg ${MOOD_DICTIONARY[item.userMood[0].emotion]?.color.replace('text', 'bg')}/20 bg-white dark:bg-slate-800`}>
                                    <span className="text-sm">{MOOD_DICTIONARY[item.userMood[0].emotion]?.emoji}</span>
                                </div>
                                <div className="flex-1 pb-6 border-b border-slate-100 dark:border-white/5 last:border-0">
                                    <p className="text-xs text-slate-400 mb-1">
                                        {item.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
                                        Feeling {item.userMood[0].emotion}
                                    </h4>
                                    {/* enhanced text area */}
                                    <p className="text-xs text-slate-500 italic font-medium">
                                        {getPreviewText()}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default Profile;