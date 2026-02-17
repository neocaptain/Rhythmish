import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnalysisResult, SongRecommendation } from '../services/ai';
import { searchYouTubeVideo } from '../services/youtube';
import LikeButton from '../components/LikeButton';
import { db, auth } from '../services/firebase';
import { collection, serverTimestamp, addDoc } from 'firebase/firestore';

interface Song {
    id: string;
    title: string;
    artist: string;
    cover: string;
    thumbnail: string;
}

interface RecommendedSongsProps {
    result: AnalysisResult;
    songs: Song[];
    onBack: () => void;
    onRefresh: () => void;
}

const RecommendedSongs: React.FC<RecommendedSongsProps> = ({ result, songs, onBack, onRefresh }) => {
    const { recommendations, headline } = result;
    const [selectedSong, setSelectedSong] = useState<SongRecommendation | null>(null);
    const [augmentedSongs, setAugmentedSongs] = useState<SongRecommendation[]>(recommendations);
    // 1. ref to prevent duplicate saving
    const hasSavedToHistory = useRef(false);

    useEffect(() => {
        const saveToMoodHistory = async () => {
            const user = auth.currentUser;

            // save condition: not saved yet, and songs are loaded
            if (hasSavedToHistory.current || !songs || songs.length === 0) return;

            try {
                // 2. data structure connected to Discover page's 'Trending Track' logic
                await addDoc(collection(db, "mood_history"), {
                    uid: user?.uid || "anonymous",
                    userNickname: user?.displayName || "Anonymous",
                    photoURL: user?.photoURL || "",
                    moodLabel: result.emotions[0].label, // analyzed emotion

                    // 3. key data for trend aggregation (first recommended song)
                    trendingTrack: {
                        id: songs[0].id || 'unknown',
                        title: songs[0].title,
                        artist: songs[0].artist,
                        cover: songs[0].cover || songs[0].thumbnail // check field name
                    },

                    timestamp: serverTimestamp(),
                });

                hasSavedToHistory.current = true;
                console.log("✅ Mood & Trending data saved to Firestore");
            } catch (error) {
                console.error("❌ Error saving to mood_history:", error);
            }
        };

        saveToMoodHistory();
    }, [songs, result]); // when the song list or result changes

    useEffect(() => {
        const augmentData = async () => {
            const updatedSongs = await Promise.all(
                recommendations.map(async (song) => {
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
            setAugmentedSongs(updatedSongs);
        };
        augmentData();
    }, [recommendations]);

    // Generate YouTube thumbnail URL
    const getYouTubeThumbnail = (song: SongRecommendation): string => {
        // Use youtubeVideoId if available and seems valid
        if (song.youtubeVideoId && song.youtubeVideoId.length === 11 && song.youtubeVideoId !== '11-character-id') {
            return `https://img.youtube.com/vi/${song.youtubeVideoId}/hqdefault.jpg`;
        }

        // Fallback to Unsplash based on song keywords
        return song.thumbnail || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60';
    };

    const handlePlayOnYouTube = (song: SongRecommendation) => {
        const url = song.youtubeVideoId
            ? `https://www.youtube.com/watch?v=${song.youtubeVideoId}`
            : `https://www.youtube.com/results?search_query=${encodeURIComponent(song.searchQuery)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-300 overflow-y-auto no-scrollbar">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200/50 dark:border-white/5">
                <button onClick={onBack} className="w-10 h-10 flex items-center justify-end text-slate-700 dark:text-white">
                    <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>
                <h1 className="text-lg font-semibold tracking-tight">Sounds for your Mood</h1>
                <button onClick={onRefresh} className="w-10 h-10 rounded-full flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">refresh</span>
                </button>
            </header>

            <main className="px-4 pb-32">
                <div className="py-6 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3">
                        <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-xs font-bold uppercase tracking-widest text-primary text-left">Analyzed Mood</span>
                    </div>
                    <h2 className="text-3xl font-bold text-center tracking-tight text-slate-900 dark:text-white">{headline}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center max-w-[280px]">
                        {recommendations.length} tracks sorted by your mood match score.
                    </p>
                </div>

                <div className="space-y-4">
                    {augmentedSongs.map((song, idx) => (
                        <motion.div
                            key={song.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group bg-white dark:bg-[#211b27] rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-white/5 transition-all text-left"
                        >
                            <div className="aspect-video w-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                    style={{ backgroundImage: `url('${getYouTubeThumbnail(song)}')` }}
                                />
                                <div className="absolute inset-0 bg-black/20"></div>
                                <LikeButton
                                    song={song}
                                    userMood={result.emotions}
                                />
                                <button
                                    onClick={() => setSelectedSong(song)}
                                    className="absolute top-3 right-3 bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-md hover:bg-primary/90 transition-colors cursor-pointer active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-[14px] fill-1">bolt</span>
                                    <span>{song.matchScore}% Match</span>
                                </button>
                                <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-tighter">
                                    {song.duration}
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">{song.title}</h3>
                                        <div className="flex flex-wrap gap-1.5 mb-1">
                                            {song.tags.map(tag => (
                                                <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/10">{tag}</span>
                                            ))}
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">{song.artist}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handlePlayOnYouTube(song)}
                                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">play_circle</span>
                                    <span>Play on YouTube</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
                <div className="h-28"></div>
            </main>

            <div className="fixed bottom-6 left-0 right-0 px-6 z-50 max-w-[430px] mx-auto">
                <div className="flex gap-3">
                    <button
                        onClick={onRefresh}
                        className="flex-1 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 text-slate-900 dark:text-white font-semibold py-4 rounded-full shadow-2xl flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                        <span>Refine Mood</span>
                    </button>
                    <button className="size-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center transition-transform active:scale-95 shrink-0">
                        <span className="material-symbols-outlined">share</span>
                    </button>
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pointer-events-none"></div>

            {/* Match Reason Modal */}
            <AnimatePresence>
                {selectedSong && (
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
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="size-2 rounded-full bg-primary/40"></div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Your Mood</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="size-2 rounded-full bg-primary"></div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Song Profile</span>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        {result.emotions.map((userEmotion, idx) => {
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
                                                        {/* User Bar (Background/Ghost) */}
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${userEmotion.value}%` }}
                                                            transition={{ delay: idx * 0.1, duration: 0.8 }}
                                                            className="absolute inset-y-0 left-0 bg-primary/20 rounded-full"
                                                        />
                                                        {/* Song Bar (Foreground/Active) */}
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
                                </div>
                                <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                        <strong>{selectedSong.title}</strong> by {selectedSong.artist} scored <strong>{selectedSong.matchScore}%</strong> because it aligns with your <strong>{headline}</strong> mood profile.
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
        </div>
    );
};

export default RecommendedSongs;
