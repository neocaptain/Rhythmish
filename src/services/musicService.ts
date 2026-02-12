import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// 2. Play Next (Local State Management)
export const playNext = (currentQueue: any[], nextSong: any) => {
    const newQueue = [...currentQueue];
    // Insert the song right after the current index (e.g., index 0)
    newQueue.splice(1, 0, nextSong);
    return newQueue;
};

// 5. Don't Recommend This Style (AI Feedback)
export const reportNegativeFeedback = async (userId: string, songData: any) => {
    try {
        const feedbackRef = collection(db, "user_feedback");
        await addDoc(feedbackRef, {
            userId,
            songId: songData.id,
            genre: songData.genre || "unknown",
            artist: songData.artist,
            type: "DISLIKE_STYLE",
            createdAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error("Feedback failed:", error);
        return false;
    }
};