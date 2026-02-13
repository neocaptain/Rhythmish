import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../services/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getPersonalizedMixtape } from "../services/moodService";
import { searchYouTubeVideo } from '../services/youtube';
import type { SongRecommendation, AnalysisResult } from '../services/ai';
import LikeButton from '../components/LikeButton';
import ActionSheet from '../components/ActionSheet';

// 1. Define Props Interface for the component
interface PersonalizedMixtapeProps {
    currentMoodResult?: string; // Analysis result passed from App.tsx
    onBack?: () => void;        // Function to go back to Discover page
}

const PersonalizedMixtape: React.FC<PersonalizedMixtapeProps> = ({
    currentMoodResult,
    onBack
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [personalMsg, setPersonalMsg] = useState("Tuning into your rhythm...");
    const [augmentedSongs, setAugmentedSongs] = useState<SongRecommendation[]>([]);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [selectedSong, setSelectedSong] = useState<SongRecommendation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
    const [currentActionSong, setCurrentActionSong] = useState<SongRecommendation | null>(null);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingStep, setLoadingStep] = useState("Connecting to your rhythm...");

    useEffect(() => {
        const fetchMixtape = async () => {
            setIsLoading(true);
            setLoadingProgress(10);
            setLoadingStep("Reading your recent mood...");

            try {
                // Step 1: Fetch Mixtape from Firestore/AI
                const { message, result } = await getPersonalizedMixtape(currentMoodResult);
                setPersonalMsg(message);
                setAnalysisResult(result);
                setLoadingProgress(40);
                setLoadingStep("Curating your personal tracks...");

                if (result && result.recommendations) {
                    const total = result.recommendations.length;
                    const songsWithYt: SongRecommendation[] = [];

                    // Step 2: Fetch YouTube data one by one to track progress
                    for (let i = 0; i < total; i++) {
                        const song = result.recommendations[i];
                        setLoadingStep(`Tuning: ${song.title}...`);

                        const ytData = await searchYouTubeVideo(song.searchQuery);
                        songsWithYt.push(ytData ? {
                            ...song,
                            youtubeVideoId: ytData.videoId,
                            thumbnail: ytData.thumbnail
                        } : song);

                        // Calculate progress from 40% to 90%
                        const currentProgress = 40 + Math.floor(((i + 1) / total) * 50);
                        setLoadingProgress(currentProgress);
                    }
                    setAugmentedSongs(songsWithYt);
                }

                setLoadingProgress(100);
                setLoadingStep("Ready to play!");

                // Final slight delay for smooth transition
                setTimeout(() => setIsLoading(false), 500);

            } catch (error) {
                console.error("Failed to fetch mixtape:", error);
                setIsLoading(false);
            }
        };

        if (user) fetchMixtape();
    }, [user, currentMoodResult]);

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
                // Pass currentMoodResult to the service if available
                const { message, result } = await getPersonalizedMixtape(currentMoodResult);
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
    }, [user, currentMoodResult]); // Re-fetch if mood result changes

    const getYouTubeThumbnail = (song: SongRecommendation): string => {
        if (song.youtubeVideoId && song.youtubeVideoId.length === 11) {
            return `https://img.youtube.com/vi/${song.youtubeVideoId}/hqdefault.jpg`;
        }
        return song.thumbnail || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60';
    };

    return (
        <div className="relative flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-background-dark">
            {/* 1. Loading Overlay (Shows only when isLoading is true) */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 z-[200] bg-white dark:bg-[#0f0a15] flex flex-col items-center justify-center p-8 text-center"
                    >
                        {/* Pulsing Aura Effect */}
                        <div className="relative mb-10">
                            <motion.div
                                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="absolute inset-0 bg-primary rounded-full blur-3xl"
                            />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                                className="w-28 h-28 bg-gradient-to-tr from-primary to-purple-400 rounded-full flex items-center justify-center shadow-2xl relative z-10"
                            >
                                <span className="material-symbols-outlined text-white text-5xl fill-1">auto_awesome</span>
                            </motion.div>
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                            Creating Your Mix
                        </h2>

                        {/* Dynamic Step Message */}
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 h-6">
                            {loadingStep}
                        </p>

                        {/* Modern Progress Bar */}
                        <div className="w-full max-w-xs h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden relative">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${loadingProgress}%` }}
                                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                                className="absolute inset-y-0 left-0 bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.6)]"
                            />
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-[12px] font-black text-primary tracking-widest">
                                {loadingProgress}%
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. Main Content (Shows only when isLoading is false) */}
            {!isLoading && (
                <>
                    {/* Background Gradient Mesh */}
                    <div className="absolute top-0 left-0 w-full h-full gradient-mesh pointer-events-none z-0"></div>

                    <main className="flex-1 overflow-y-auto no-scrollbar z-10 px-6 pb-28">
                        <header className="pt-6 pb-8">
                            {/* Top Navigation */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-4">
                                    {/* Back Button */}
                                    <button
                                        onClick={onBack}
                                        className="size-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                                    >
                                        <span className="material-symbols-outlined">arrow_back</span>
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                                            <span className="material-symbols-outlined text-white text-base fill-1">auto_awesome</span>
                                        </div>
                                        <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Mixtape</h1>
                                    </div>
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

                            {/* Personalized Message Card */}
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
                                    {augmentedSongs.length} Tracks
                                </span>
                            </div>
                        </header>

                        {/* Song List */}
                        <div className="space-y-4">
                            {augmentedSongs.map((track, index) => (
                                <motion.div
                                    key={track.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glass-card rounded-xl p-3 flex items-center gap-4 group active:scale-[0.98] transition-all relative"
                                >
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={getYouTubeThumbnail(track)} alt={track.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
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
                            ))}
                        </div>

                        {/* Empty State */}
                        {augmentedSongs.length === 0 && (
                            <div className="text-center py-20">
                                <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">music_off</span>
                                <p className="text-slate-400 text-sm">No recommendations yet. Try liking some songs!</p>
                            </div>
                        )}

                        <div className="mt-10 mb-6 text-center">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Powered by YouTube & Rhytmix AI</p>
                        </div>
                    </main>
                </>
            )}

            {/* Modals & Sheets (Always present in DOM) */}
            <AnimatePresence>
                {selectedSong && analysisResult && (
                    /* ... (기존 Match Reason Modal 코드 동일) ... */
                )}
            </AnimatePresence>

            <ActionSheet
                isOpen={isActionSheetOpen}
                onClose={() => setIsActionSheetOpen(false)}
                song={currentActionSong}
                currentMood={analysisResult?.emotions[0]?.label}
            />
        </div>
    );
};

export default PersonalizedMixtape;