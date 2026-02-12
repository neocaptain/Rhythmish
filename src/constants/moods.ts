export type MoodCategory = "positive" | "negative" | "neutral";

interface MoodDetail {
    label: string;
    category: MoodCategory;
    emoji: string;
    color: string;
}

export const MOOD_DICTIONARY: Record<string, MoodDetail> = {
    // Positive Group
    "Happy": { label: "Happy", category: "positive", emoji: "😊", color: "text-yellow-400" },
    "Fluttery": { label: "Fluttery", category: "positive", emoji: "💖", color: "text-pink-400" },
    "Peaceful": { label: "Peaceful", category: "positive", emoji: "🌿", color: "text-green-400" },
    "Energetic": { label: "Energetic", category: "positive", emoji: "⚡", color: "text-orange-400" },

    // Negative Group
    "Sad": { label: "Sad", category: "negative", emoji: "😢", color: "text-blue-400" },
    "Stressed": { label: "Stressed", category: "negative", emoji: "😫", color: "text-red-400" },
    "Lonely": { label: "Lonely", category: "negative", emoji: "🌊", color: "text-indigo-400" },
    "Tired": { label: "Tired", category: "negative", emoji: "😴", color: "text-slate-400" },

    // Neutral/Contextual Group
    "Focus": { label: "Focus", category: "neutral", emoji: "🧐", color: "text-purple-400" },
};