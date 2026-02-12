import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
    shareSongWithMood: async (songTitle: string, mood: string) => {
        const shareData = {
            title: 'Rhythmish Mood Discovery',
            text: `I'm feeling "${mood}" today and found this perfect track: ${songTitle}! Check my rhythm on Rhythmish.`,
            url: window.location.href, // Or your app's deployment URL
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback for browsers that don't support Web Share API
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                alert("Link copied to clipboard!");
            }
        } catch (error) {
            console.error("Error sharing:", error);
        }
    }
};