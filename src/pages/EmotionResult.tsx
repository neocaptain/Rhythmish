import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { AnalysisResult } from '../services/ai';
import { getMoodImageDetailed } from '../services/unsplash';
import { saveMoodResult } from "../services/moodService";

interface EmotionResultProps {
    result: AnalysisResult;
    onShowRecommendations: () => void;
    onBack: () => void;
    imageFile?: File; // camera or gallery image file
    inputType: "text" | "gallery" | "camera"; // input type
    userInputText?: string; // user input text (diary content etc)
}

const EmotionResult: React.FC<EmotionResultProps> = ({ result, onShowRecommendations, onBack, imageFile, inputType, userInputText }) => {

    const { headline, emotions, summary } = result;
    const [moodImage, setMoodImage] = useState<string>('');
    const [isSaved, setIsSaved] = useState(false); // prevent duplicate saving
    const hasSaved = useRef(false);

    useEffect(() => {
        const saveMoodHistory = async () => {
            // stop duplicate saving
            if (hasSaved.current || !result) return;

            try {
                // save to Firestore
                // const docRef = await addDoc(collection(db, "mood_history"), { ... });

                console.log("Mood history saved successfully!");

                // set flag to true
                hasSaved.current = true;
            } catch (error) {
                console.error("Error saving mood history:", error);
            }
        };

        saveMoodHistory();
    }, [result]); // execute only when result changes, but hasSaved.current prevents duplicate saving

    // 1. Fetch mood-related image based on the headline
    useEffect(() => {
        const fetchMoodImage = async () => {
            console.log('EmotionResult: Fetching image for headline:', headline);
            const imageUrl = await getMoodImageDetailed(headline);
            console.log('EmotionResult: Setting moodImage to:', imageUrl);
            setMoodImage(imageUrl);
        };
        fetchMoodImage();
    }, [headline]);

    // Save analysis results to Firestore (automatic execution)
    useEffect(() => {
        const handleAutoSave = async () => {
            // prevent duplicate saving
            if (isSaved || !result) return;

            // convert userMood format (label -> emotion, value -> score)
            const formattedMood = emotions.map(e => ({
                emotion: e.label,
                score: e.value
            }));

            try {
                await saveMoodResult({
                    userMood: formattedMood,
                    inputType: inputType,
                    // if image, save summary, if text, save original input
                    userInput: inputType === 'text' ? (userInputText || summary) : summary,
                    imageFile: imageFile || null
                });
                setIsSaved(true); // save complete
                console.log("EmotionResult: Data saved to Firestore successfully.");
            } catch (error) {
                console.error("EmotionResult: Failed to save data.", error);
            }
        };

        handleAutoSave();
    }, [result, imageFile, inputType, userInputText, isSaved]);

    // Log whenever moodImage changes
    useEffect(() => {
        console.log('EmotionResult: moodImage state updated to:', moodImage);
    }, [moodImage]);

    return (
        /* pb-40 to ensure scroll space for bottom navigation + button height */
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-300 overflow-y-auto no-scrollbar pb-40">
            {/* Top App Bar */}
            <header className="flex items-center p-4 pb-2 justify-between sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <button
                    onClick={onBack}
                    className="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-900 dark:text-white font-bold">arrow_back_ios_new</span>
                </button>
                <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Analysis Result</h2>
            </header>

            {/* Main Content */}
            <main className="px-6 flex-1">
                {/* Abstract Art / Mood Visualizer */}
                <div className="flex w-full py-8">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative w-full aspect-square rounded-3xl overflow-hidden flex items-center justify-center group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-indigo-500/30 opacity-30"></div>
                        {moodImage ? (
                            <div
                                className="absolute inset-0 bg-center bg-no-repeat bg-cover scale-110 opacity-70"
                                style={{ backgroundImage: `url("${moodImage}")` }}
                            />
                        ) : (
                            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                        )}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary rounded-full blur-[80px] opacity-30"></div>
                    </motion.div>
                </div>

                {/* Mood Headline */}
                <div className="text-center space-y-2 mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold leading-tight px-2"
                    >
                        {headline}
                    </motion.h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium px-4">
                        AI has tuned into your vibration.
                    </p>
                </div>

                {/* Emotion Breakdown */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold tracking-tight text-left">Emotion Breakdown</h3>
                        <span className="text-primary text-xs font-bold px-2 py-1 bg-primary/10 rounded-lg">LIVE AI SCAN</span>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-5 bg-white/50 dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-sm shadow-sm"
                    >
                        {emotions.map((emotion, idx) => (
                            <div key={emotion.label} className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-semibold flex items-center gap-2">
                                        <span className={`material-symbols-outlined ${emotion.color} text-lg`}>{emotion.icon}</span>
                                        {emotion.label}
                                    </span>
                                    <span className="text-slate-500 dark:text-slate-400 font-bold">{emotion.value}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${emotion.value}%` }}
                                        transition={{ delay: 0.5 + idx * 0.1, duration: 1 }}
                                        className="h-full bg-primary rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Analysis Detail */}
                    <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 italic text-left">
                            "{summary}"
                        </p>
                    </div>
                </section>

                {/* CTA Button Area: fixed to remove and place at the end of the content */}
                <div className="mt-12 px-2">
                    <button
                        onClick={onShowRecommendations}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                    >
                        <span>Show Recommendations</span>
                        <span className="material-symbols-outlined">auto_awesome</span>
                    </button>
                    {/* prevent collision with bottom navigation bar */}
                    <div className="h-8"></div>
                </div>
            </main>
        </div>
    );
};

export default EmotionResult;
