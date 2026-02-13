import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export const handleSongActions = {
    // 1. Open in YouTube
    openInYouTube: (videoId: string) => {
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    },

    // 3. Add to My Playlist (Firestore)
    addToMyPlaylist: async (userId: string, playlistName: string, song: any) => {
        try {
            const playlistRef = collection(db, "user_playlists");
            await addDoc(playlistRef, {
                userId,
                playlistName,
                songId: song.id,
                title: song.title,
                addedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error("Failed to add to playlist:", error);
            return { success: false };
        }
    },

    // 4. Share with Mood Analysis Result
    shareSongWithMood: async (songTitle: string, mood: string, videoId?: string) => {
        // 1. Generate YouTube link if videoId exists
        const youtubeUrl = videoId
            ? `https://www.youtube.com/watch?v=${videoId}`
            : "";

        const shareData = {
            title: 'Rhythmish Mood Discovery',
            text: `I'm feeling "${mood}" today and found this perfect track: ${songTitle}! Check it out on YouTube.`,
            url: youtubeUrl || window.location.href, // Fallback to app URL if no videoId
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback for browsers (desktop, etc.)
                const fullText = `${shareData.text} ${shareData.url}`;
                await navigator.clipboard.writeText(fullText);
                // Using toast instead of alert for better UI
                toast.success("Link copied to clipboard!");
            }
        } catch (error) {
            // Ignore abort errors (when user cancels sharing)
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error("Error sharing:", error);
            }
        }
    }
};

export const syncUserBlacklist = async (userId: string) => {
    try {
        const feedbackRef = collection(db, "user_feedback");
        const q = query(
            feedbackRef,
            where("userId", "==", userId),
            where("type", "==", "DISLIKE_STYLE")
        );

        const snapshot = await getDocs(q);
        const blacklist = {
            artists: [] as string[],
            genres: [] as string[]
        };

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.artist) blacklist.artists.push(data.artist);
            if (data.genre) blacklist.genres.push(data.genre);
        });

        // Save to localStorage as a stringified JSON
        localStorage.setItem(`blacklist_${userId}`, JSON.stringify(blacklist));
        console.log("Blacklist synced to local storage");
    } catch (error) {
        console.error("Failed to sync blacklist:", error);
    }
};