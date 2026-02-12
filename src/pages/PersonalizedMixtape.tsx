import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../services/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getPersonalizedMixtape } from "../services/moodService";
import { searchYouTubeVideo } from '../services/youtube';
import type { SongRecommendation, AnalysisResult } from '../services/ai';
import LikeButton from '../components/LikeButton';
import ActionSheet from '../components/ActionSheet';

const PersonalizedMixtape: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [personalMsg, setPersonalMsg] = useState("Tuning into your rhythm...");
    const [augmentedSongs, setAugmentedSongs] = useState<SongRecommendation[]>([]);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [selectedSong, setSelectedSong] = useState<SongRecommendation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
    const [currentActionSong, setCurrentActionSong] = useState<SongRecommendation | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchMixtape = async () => {
            setIsLoading(true);
            try {
                const { message, result } = await getPersonalizedMixtape();
                setPersonalMsg(message);
                setAnalysisResult(result);

                if (result && result.recommendations) {
                    const songsWithYt = await Promise.all(
                        result.recommendations.map(async (song) => {
                            const ytData = await searchYouTubeVideo(song.searchQuery);
                            if (ytData) {
                                return {
                                    ...song,
                                    youtubeVideoId: ytData.videoId,
                                    thumbnail: ytData.thumbnail
                                };
                            }
                            return song;
                        })
                    );
                    setAugmentedSongs(songsWithYt);
                }
            } catch (error) {
                console.error("Failed to fetch personalized mixtape:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchMixtape();
        }
    }, [user]);


    const getYouTubeThumbnail = (song: SongRecommendation): string => {
        if (song.youtubeVideoId && song.youtubeVideoId.length === 11) {
            return `https://img.youtube.com/vi/${song.youtubeVideoId}/hqdefault.jpg`;
        }
        return song.thumbnail || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60';
    };

    return (
        <div className="relative flex-1 flex flex-col overflow-hidden">
            {/* Background Gradient Mesh */}
            <div className="absolute top-0 left-0 w-full h-full gradient-mesh pointer-events-none z-0"></div>

            <main className="flex-1 overflow-y-auto no-scrollbar z-10 px-6 pb-28">
                <header className="pt-6 pb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                                <span className="material-symbols-outlined text-white text-xl fill-1">auto_awesome</span>
                            </div>
                            <h1 className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">Rhytmix</h1>
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-primary/30 p-0.5 overflow-hidden">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="bg-slate-200 dark:bg-slate-700 w-full h-full flex items-center justify-center rounded-full">
                                    <span className="material-symbols-outlined text-slate-400">person</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-2xl p-5 mb-8 border-l-4 border-l-primary shadow-xl shadow-primary/5"
                    >
                        <p className="text-lg leading-snug text-slate-700 dark:text-slate-200">
                            {personalMsg}
                            <span className="material-symbols-outlined text-sm align-middle ml-1 fill-1 text-primary">auto_awesome</span>
                        </p>
                    </motion.div>

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-primary/80">Your Personal Mix</h2>
                        <span className="text-xs text-slate-400 font-medium">
                            {isLoading ? "..." : augmentedSongs.length} Tracks
                        </span>
                    </div>
                </header>

                <div className="space-y-4">
                    {isLoading ? (
                        [1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="glass-card rounded-xl p-3 flex items-center gap-4 animate-pulse">
                                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-lg flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                                </div>
                            </div>
                        ))
                    ) : (
                        augmentedSongs.map((track, index) => (
                            <motion.div
                                key={track.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card rounded-xl p-3 flex items-center gap-4 group active:scale-[0.98] transition-all relative"
                            >
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={getYouTubeThumbnail(track)} alt={track.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-white text-3xl fill-1">play_arrow</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-base truncate text-slate-900 dark:text-white">{track.title}</h3>
                                    <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedSong(track);
                                        }}
                                        className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-1 hover:bg-primary/20 transition-colors"
                                    >
                                        {track.matchScore}% Match
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <LikeButton
                                            song={track}
                                            userMood={analysisResult?.emotions || []}
                                            className="relative size-9"
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentActionSong(track);
                                                setIsActionSheetOpen(true);
                                            }}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-slate-400 text-xl">more_vert</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {!isLoading && augmentedSongs.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-slate-400 text-sm">No recommendations yet. Try liking some songs!</p>
                    </div>
                )}

                <div className="mt-10 mb-6 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Powered by YouTube & Rhytmix AI</p>
                </div>
            </main>

            {/* Match Reason Modal */}
            <AnimatePresence>
                {selectedSong && analysisResult && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedSong(null)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#211b27] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-white/10"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Why {selectedSong.matchScore}% Match?</h3>
                                <button onClick={() => setSelectedSong(null)} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">close</span>
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-5">
                                    {analysisResult.emotions.map((userEmotion, idx) => {
                                        const songEmotion = selectedSong.emotions.find(e => e.label === userEmotion.label);
                                        return (
                                            <div key={userEmotion.label} className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                                        <span className={`material-symbols-outlined ${userEmotion.color} text-base`}>{userEmotion.icon}</span>
                                                        {userEmotion.label}
                                                    </span>
                                                    <div className="flex gap-4">
                                                        <span className="text-[10px] font-black text-slate-400">{userEmotion.value}%</span>
                                                        <span className="text-[10px] font-black text-primary">{songEmotion?.value || 0}%</span>
                                                    </div>
                                                </div>
                                                <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${userEmotion.value}%` }}
                                                        transition={{ delay: idx * 0.1, duration: 0.8 }}
                                                        className="absolute inset-y-0 left-0 bg-primary/20 rounded-full"
                                                    />
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${songEmotion?.value || 0}%` }}
                                                        transition={{ delay: idx * 0.1 + 0.2, duration: 0.8 }}
                                                        className="absolute inset-y-0 left-0 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                        <strong>{selectedSong.title}</strong> by {selectedSong.artist} scored <strong>{selectedSong.matchScore}%</strong> because it aligns with your profile.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedSong(null)}
                                className="w-full mt-6 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Got it!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Sheet */}
            <ActionSheet
                isOpen={isActionSheetOpen}
                onClose={() => setIsActionSheetOpen(false)}
                song={currentActionSong}
            />
        </div>
    );
};

export default PersonalizedMixtape;
