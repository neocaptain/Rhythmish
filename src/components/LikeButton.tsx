import React, { useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import type { SongRecommendation, Emotion } from '../services/ai';

interface LikeButtonProps {
    song: SongRecommendation;
    userMood: Emotion[];
}

const LikeButton: React.FC<LikeButtonProps> = ({ song, userMood }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering parent click handlers

        if (isLiked) return; // Prevent double likes for now

        const user = auth.currentUser;
        if (!user) {
            alert("Please sign in to save favorite songs! ✨");
            return;
        }

        setIsLoading(true);

        try {
            // Map our internal structures to the user's requested Firestore structure
            const songMoods = song.emotions.map(e => ({
                label: e.label,
                value: e.value
            }));

            const moodData = userMood.map(e => ({
                emotion: e.label,
                score: e.value
            }));

            await addDoc(collection(db, "liked_songs"), {
                userId: user.uid,
                title: song.title,
                artist: song.artist,
                matchScore: Number(song.matchScore), // Ensure it's a number
                youtubeVideoId: song.youtubeVideoId,
                songMoods: songMoods,
                userMood: moodData,
                tags: Array.isArray(song.tags) ? song.tags : [], // Ensure it's a string array
                duration: song.duration,
                createdAt: serverTimestamp()
            });

            setIsLiked(true);
            alert("Saved to Rhythmish's treasure box! ✨");
        } catch (error) {
            console.error("Error saving liked song:", error);
            alert("Failed to save to treasure box. Please try again!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            disabled={isLoading}
            className={`absolute top-3 left-3 size-9 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all z-10 ${isLiked
                ? 'bg-primary text-white'
                : 'bg-black/40 text-white hover:bg-black/60'
                }`}
        >
            <span className={`material-symbols-outlined text-[20px] ${isLiked ? 'fill-1' : ''}`}>
                {isLiked ? 'favorite' : 'favorite'}
            </span>
        </motion.button>
    );
};

export default LikeButton;
