import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

export const useTrendingTrack = (dominantMood: string) => {
    const [trendingTrack, setTrendingTrack] = useState<any>(null);

    useEffect(() => {
        // 1. calculate time one hour ago
        const oneHourAgo = new Timestamp(Math.floor(Date.now() / 1000) - 3600, 0);

        // 2. query: get data for the same emotion within the last hour
        const q = query(
            collection(db, "mood_history"),
            where("moodLabel", "==", dominantMood),
            where("timestamp", ">=", oneHourAgo),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                setTrendingTrack(null);
                return;
            }

            // 3. count the number of appearances for each song (find the most frequent value)
            const counts: Record<string, { count: number; data: any }> = {};
            snapshot.docs.forEach(doc => {
                const track = doc.data().trendingTrack;
                if (track && track.id) {
                    if (!counts[track.id]) {
                        counts[track.id] = { count: 0, data: track };
                    }
                    counts[track.id].count++;
                }
            });

            const sortedTracks = Object.values(counts).sort((a, b) => b.count - a.count);
            setTrendingTrack(sortedTracks[0]?.data || null);
        });

        return () => unsubscribe();
    }, [dominantMood]);

    return trendingTrack;
};