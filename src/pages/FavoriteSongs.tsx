import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../services/firebase';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc
} from 'firebase/firestore';

interface LikedSong {
    id: string;
    title: string;
    artist: string;
    matchScore: number;
    youtubeVideoId: string;
    tags: string[];
    duration: string;
    createdAt: any;
    userMood: Array<{ emotion: string; score: number }>;
    songMoods: Array<{ label: string; value: number }>;
}

interface FavoriteSongsProps {
    onBack: () => void;
}

const FavoriteSongs: React.FC<FavoriteSongsProps> = ({ onBack }) => {
    const [songs, setSongs] = useState<LikedSong[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        // Create query: matching userId, ordered by creation date
        // Note: This might require a composite index in Firestore (userId + createdAt)
        // If it fails, we'll try a simpler query and sort in memory.
        const q = query(
            collection(db, "liked_songs"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const songsArray: LikedSong[] = [];
            querySnapshot.forEach((doc) => {
                songsArray.push({ id: doc.id, ...doc.data() } as LikedSong);
            });

            setSongs(songsArray);
            setLoading(false);
        }, (error) => {
            console.error("Firestore loading error:", error);
            // Fallback: try without orderBy if index is missing
            if (error.code === 'failed-precondition') {
                const simpleQ = query(
                    collection(db, "liked_songs"),
                    where("userId", "==", user.uid)
                );
                onSnapshot(simpleQ, (snap) => {
                    const array = snap.docs.map(d => ({ id: d.id, ...d.data() } as LikedSong));
                    // Sort manually if index is missing
                    array.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                    setSongs(array);
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleRemove = async (songId: string) => {
        try {
            await deleteDoc(doc(db, "liked_songs", songId));
        } catch (error) {
            console.error("Error removing song:", error);
        }
    };

    const handlePlayOnYouTube = (videoId: string, title: string, artist: string) => {
        if (videoId && videoId !== '11-character-id') {
            window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
        } else {
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(artist + " " + title)}`, '_blank');
        }
    };

    const filteredSongs = songs.filter(song => {
        const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'All' || song.tags.some(tag => tag.includes(activeFilter));
        return matchesSearch && matchesFilter;
    });

    // Unique tags for filters (excluding 'All')
    const allTags = Array.from(new Set(songs.flatMap(s => s.tags))).slice(0, 5);

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-hidden">
            {/* Sticky Header Area */}
            <div className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-4 pb-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-1 -ml-1 text-slate-500 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-3xl font-bold">chevron_left</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-3xl font-bold">favorite</span>
                            <h1 className="text-2xl font-bold tracking-tight">Favorites</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`relative flex items-center transition-all duration-300 ${searchQuery ? 'w-40' : 'w-10'}`}>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`h-10 bg-white/5 border border-white/10 rounded-full px-4 text-xs transition-all duration-300 outline-none focus:border-primary/50 ${searchQuery ? 'opacity-100 pr-10' : 'opacity-0'}`}
                            />
                            <button
                                onClick={() => setSearchQuery(searchQuery ? '' : ' ')}
                                className="absolute right-0 p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <span className="material-symbols-outlined text-2xl">{searchQuery ? 'close' : 'search'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex gap-3 mt-2">
                    <button className="flex-1 bg-primary hover:bg-primary/91 text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                        <span>Play All</span>
                    </button>
                    <button className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined">shuffle</span>
                    </button>
                </div>

                {/* Mood Filter Chips (Horizontal Scroll) */}
                {!loading && songs.length > 0 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveFilter('All')}
                            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 border transition-all ${activeFilter === 'All' ? 'bg-primary text-white border-primary/20' : 'bg-white/5 text-white/70 border-white/10'}`}
                        >
                            <p className="text-sm font-semibold">All</p>
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setActiveFilter(tag)}
                                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 border transition-all ${activeFilter === tag ? 'bg-primary text-white border-primary' : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'}`}
                            >
                                <p className="text-sm font-medium">{tag.replace('#', '')}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto px-4 pb-24 space-y-1 custom-scrollbar">
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-4 opacity-50">
                        <div className="size-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-sm font-medium">Rhythmish is opening the treasure box... 🐾</p>
                    </div>
                ) : filteredSongs.length === 0 ? (
                    <div className="h-80 flex flex-col items-center justify-center text-center px-8 opacity-30">
                        <span className="material-symbols-outlined text-7xl mb-4">folder_open</span>
                        <p className="font-bold text-lg mb-1">Your treasure box is empty</p>
                        <p className="text-sm">Tap the heart on songs you love to fill it up! ✨</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredSongs.map((song, idx) => (
                            <motion.div
                                key={song.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group flex items-center gap-4 py-3 px-2 rounded-xl hover:bg-white/5 transition-colors"
                            >
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg shadow-md border border-white/5">
                                    <img
                                        alt={song.title}
                                        className="h-full w-full object-cover"
                                        src={`https://img.youtube.com/vi/${song.youtubeVideoId}/mqdefault.jpg`}
                                    />
                                    <button
                                        onClick={() => handlePlayOnYouTube(song.youtubeVideoId, song.title, song.artist)}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="material-symbols-outlined text-white text-3xl">play_circle</span>
                                    </button>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-base truncate">{song.title}</h3>
                                        <span className="text-[10px] font-black text-primary px-1.5 py-0.5 bg-primary/10 rounded">{song.matchScore}%</span>
                                    </div>
                                    <p className="text-slate-500 dark:text-white/50 text-sm truncate">{song.artist}</p>
                                    <div className="flex gap-1.5 mt-1.5 overflow-x-hidden">
                                        {song.tags.slice(0, 2).map((tag, tIdx) => (
                                            <span key={tIdx} className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${tIdx === 0 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white/5 text-white/60 border-white/10'}`}>
                                                {tag.replace('#', '')}
                                            </span>
                                        ))}
                                        {song.tags.length > 2 && <span className="text-[9px] text-white/30 self-center">+{song.tags.length - 2}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleRemove(song.id)}
                                        className="p-2 text-primary hover:scale-110 transition-transform active:scale-90"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                    </button>
                                    <button className="p-2 text-slate-300 dark:text-white/30 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">more_vert</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {/* End of list placeholder */}
                {!loading && filteredSongs.length > 0 && (
                    <div className="py-12 flex flex-col items-center justify-center opacity-20">
                        <span className="material-symbols-outlined text-3xl mb-2">library_music</span>
                        <p className="text-[10px] uppercase tracking-widest font-bold">End of Favorites</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default FavoriteSongs;
