import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SongRecommendation } from '../services/ai';
import { handleSongActions } from '../services/actionService'; // Import the service created earlier
import { reportNegativeFeedback } from '../services/musicService';
import { auth } from '../services/firebase';
import { toast } from 'react-hot-toast';

interface ActionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    song: SongRecommendation | null;
    currentMood?: string; // Added to pass mood info for sharing
}

const ActionSheet: React.FC<ActionSheetProps> = ({ isOpen, onClose, song, currentMood = "Good" }) => {
    if (!song) return null;

    const user = auth.currentUser;

    // Unified Menu Click Handler
    const handleMenuClick = async (actionType: string) => {
        const videoId = song.youtubeVideoId || "";

        switch (actionType) {
            case 'OPEN_YOUTUBE':
                if (videoId) {
                    handleSongActions.openInYouTube(videoId);
                } else {
                    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(song.searchQuery)}`;
                    window.open(searchUrl, '_blank');
                }
                break;

            case 'PLAY_NEXT':
                // Logic depends on your global player state
                toast.success("Added to play next!");
                break;

            case 'ADD_PLAYLIST':
                if (user) {
                    // This could trigger another sub-menu to pick a playlist
                    await handleSongActions.addToMyPlaylist(user.uid, "My Favorites", song);
                    toast.success("Added to My Favorites!");
                } else {
                    toast.error("Please login first");
                }
                break;

            case 'SHARE':
                // Pass the song's YouTube Video ID as the third argument
                await handleSongActions.shareSongWithMood(
                    song.title,
                    currentMood,
                    song.youtubeVideoId
                );
                break;

            case 'DISLIKE':
                if (user) {
                    const success = await reportNegativeFeedback(user.uid, song);
                    if (success) {
                        // Update local storage manually for immediate reflection
                        const cachedKey = `blacklist_${user.uid}`;
                        const cachedData = JSON.parse(localStorage.getItem(cachedKey) || '{"artists":[], "genres":[]}');

                        // Add new artist if not already present
                        if (!cachedData.artists.includes(song.artist)) {
                            cachedData.artists.push(song.artist);
                            localStorage.setItem(cachedKey, JSON.stringify(cachedData));
                        }

                        toast("Got it. We'll refine your future recommendations.");
                    }
                }
                break;
        }
        onClose(); // Close sheet after action
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-[120] flex justify-center"
                    >
                        <div className="w-full max-w-md bg-[#191022]/95 backdrop-blur-2xl rounded-t-3xl border-t border-primary/20 shadow-2xl overflow-hidden pb-8 px-4">
                            {/* Drag Indicator */}
                            <div className="w-full flex justify-center pt-3 pb-2">
                                <div className="w-9 h-1.5 bg-white/20 rounded-full"></div>
                            </div>

                            {/* Song Info Header */}
                            <div className="px-4 py-4 flex items-center border-b border-white/5 mb-2">
                                <div className="w-14 h-14 rounded-lg overflow-hidden mr-4 shadow-lg border border-white/10 shrink-0">
                                    <img
                                        src={song.youtubeVideoId ? `https://img.youtube.com/vi/${song.youtubeVideoId}/hqdefault.jpg` : song.thumbnail}
                                        alt={song.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="text-white text-lg font-bold truncate">{song.title}</h3>
                                    <p className="text-slate-400 text-sm truncate">{song.artist} • {song.duration}</p>
                                </div>
                            </div>

                            {/* Menu Options */}
                            <div className="space-y-1">
                                <button
                                    onClick={() => handleMenuClick('OPEN_YOUTUBE')}
                                    className="w-full flex items-center p-4 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-red-500">play_circle</span>
                                    </div>
                                    <span className="text-white text-lg font-medium">Open in YouTube</span>
                                    <span className="material-symbols-outlined ml-auto text-slate-500">open_in_new</span>
                                </button>

                                <button
                                    onClick={() => handleMenuClick('PLAY_NEXT')}
                                    className="w-full flex items-center p-4 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-primary">playlist_play</span>
                                    </div>
                                    <span className="text-white text-lg font-medium">Play Next</span>
                                </button>

                                <button
                                    onClick={() => handleMenuClick('ADD_PLAYLIST')}
                                    className="w-full flex items-center p-4 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-primary">playlist_add</span>
                                    </div>
                                    <span className="text-white text-lg font-medium">Add to My Playlist</span>
                                </button>

                                <button
                                    onClick={() => handleMenuClick('SHARE')}
                                    className="w-full flex items-center p-4 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-primary">ios_share</span>
                                    </div>
                                    <span className="text-white text-lg font-medium">Share with Friends</span>
                                </button>

                                <div className="h-px bg-white/5 mx-4 my-2"></div>

                                <button
                                    onClick={() => handleMenuClick('DISLIKE')}
                                    className="w-full flex items-center p-4 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-slate-400">block</span>
                                    </div>
                                    <span className="text-slate-300 text-lg font-medium">Don't Recommend This Style</span>
                                </button>

                                <button
                                    onClick={onClose}
                                    className="w-full text-white/40 font-semibold py-4 mt-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ActionSheet;