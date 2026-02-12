import React, { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import type { SongRecommendation, Emotion } from '../services/ai';

interface LikeButtonProps {
    song: SongRecommendation;
    userMood: Emotion[];
    className?: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ song, userMood, className }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeDocId, setLikeDocId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Check if song is already liked on mount
    useEffect(() => {
        const checkLikeStatus = async () => {
            const user = auth.currentUser;
            if (!user) return;

            try {
                const q = query(
                    collection(db, "liked_songs"),
                    where("userId", "==", user.uid),
                    where("title", "==", song.title),
                    where("artist", "==", song.artist)
                );
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    setIsLiked(true);
                    setLikeDocId(querySnapshot.docs[0].id);
                }
            } catch (error) {
                console.error("Error checking like status:", error);
            }
        };

        checkLikeStatus();
    }, [song, auth.currentUser]);

    const handleToggleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();

        const user = auth.currentUser;
        if (!user) {
            alert("Please sign in to save favorite songs! ✨");
            return;
        }

        setIsLoading(true);

        try {
            if (isLiked && likeDocId) {
                // Unlike: Remove from Firestore
                await deleteDoc(doc(db, "liked_songs", likeDocId));
                setIsLiked(false);
                setLikeDocId(null);
                // alert("Removed from your treasure box! 🗑️");
            } else {
                // Like: Add to Firestore
                const songMoods = song.emotions.map(e => ({
                    label: e.label,
                    value: e.value
                }));

                const moodData = userMood.map(e => ({
                    emotion: e.label,
                    score: e.value
                }));

                const newDoc = await addDoc(collection(db, "liked_songs"), {
                    userId: user.uid,
                    title: song.title,
                    artist: song.artist,
                    matchScore: Number(song.matchScore),
                    youtubeVideoId: song.youtubeVideoId,
                    songMoods: songMoods,
                    userMood: moodData,
                    tags: Array.isArray(song.tags) ? song.tags : [],
                    duration: song.duration,
                    createdAt: serverTimestamp()
                });

                setIsLiked(true);
                setLikeDocId(newDoc.id);
                // alert("Saved to Rhythmish's treasure box! ✨");
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            alert("Action failed. Please try again!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleToggleLike}
            disabled={isLoading}
            className={`${className || 'absolute top-3 left-3 size-9 backdrop-blur-md border border-white/10'} rounded-full flex items-center justify-center active:scale-95 transition-all z-10 ${isLiked
                ? 'text-rose-500 bg-rose-500/10 border-rose-500/20'
                : 'text-slate-400 bg-slate-100/50 dark:bg-white/10 dark:text-slate-400'
                }`}
        >
            <span
                className={`material-symbols-outlined text-[22px] transition-all duration-300 ${isLiked ? 'fill-1 scale-110' : 'fill-0'}`}
            >
                favorite
            </span>
        </motion.button>
    );
};

export default LikeButton;
