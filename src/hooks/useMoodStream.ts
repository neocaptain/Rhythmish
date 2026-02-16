import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

// 1. 타입을 export 합니다.
export interface MoodEntry {
    id: string;
    userNickname: string;
    moodLabel: string;
    photoURL?: string;
    timestamp: any;
}

export const useMoodStream = () => {
    const [stream, setStream] = useState<MoodEntry[]>([]);

    useEffect(() => {
        const q = query(
            collection(db, "mood_history"),
            orderBy("timestamp", "desc"),
            limit(10) // 집계 정확도를 위해 10개 정도로 늘립니다.
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const entries = snapshot.docs.map(doc => ({
                id: doc.id,
                userNickname: doc.data().userNickname || 'Anonymous',
                moodLabel: doc.data().moodLabel || 'Mysterious', // 필드명 확인 필요 (moodLabel vs label)
                photoURL: doc.data().photoURL || '',
                timestamp: doc.data().timestamp,
            }));
            setStream(entries);
        });

        return () => unsubscribe();
    }, []);

    return stream;
};