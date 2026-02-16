import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface MoodInputHomeProps {
    onAnalyze: (text: string, imageFile?: File, type?: "text" | "gallery" | "camera") => void;
}

const MoodInputHome: React.FC<MoodInputHomeProps> = ({ onAnalyze }) => {
    const [text, setText] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);    // for gallery
    const cameraInputRef = useRef<HTMLInputElement>(null);  // for camera

    // handlers
    const handleGalleryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);

            // immediately pass to analysis page with "gallery" type
            onAnalyze(text, file, "gallery");
        }
    };

    const handleCameraChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);

            // immediately pass to analysis page with "camera" type
            onAnalyze(text, file, "camera");
        }
    };

    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Speech recognition not supported in this browser.");
            return;
        }
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        setIsListening(true);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setText((prev) => prev + (prev ? ' ' : '') + transcript);
            setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const handleAnalyzeClick = () => {
        if (!text && !imageFile) return;
        const inputType = imageFile ? "gallery" : "text"; // if imageFile exists, default to "gallery"
        onAnalyze(text, imageFile || undefined, inputType);
    };

    const removeImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar">

            {/* Hero Section */}
            <div className="px-6 pt-8 pb-4 text-left">
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-slate-900 dark:text-white text-[30px] font-bold leading-[1.1]">
                    What's your <span className="text-primary">rhythm</span> today?
                </motion.h1>
            </div>

            {/* Main Input Section */}
            <div className="flex flex-col gap-6 px-6 py-4">
                <div className="flex flex-col gap-3">
                    <div className="relative">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 min-h-[144px] p-5 pb-12"
                            placeholder="I'm feeling a bit stressed but want something to help me focus..."
                        />
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                            <button onClick={handleVoiceInput} className={`flex items-center justify-center size-10 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:bg-slate-100'}`}>
                                <span className="material-symbols-outlined">{isListening ? 'mic' : 'mic_none'}</span>
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleAnalyzeClick}
                        className="flex w-full cursor-pointer items-center justify-center rounded-xl h-[50px] bg-primary text-white font-bold shadow-lg disabled:opacity-50"
                        disabled={!text && !imageFile}
                    >
                        <span className="material-symbols-outlined mr-2">psychology</span>
                        <span>Analyze Mood</span>
                    </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 py-2">
                    <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/10"></div>
                    <span className="text-slate-400 text-xs font-bold uppercase">OR</span>
                    <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/10"></div>
                </div>

                {/* Visual Input Section (Grid) */}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleGalleryChange} />
                <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleCameraChange} />

                {imagePreview ? (
                    <div className="relative group overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-4">
                        <img src={imagePreview} alt="Preview" className="size-16 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold truncate text-slate-900 dark:text-white">{imageFile?.name}</h3>
                            <p className="text-sm text-slate-500">Ready to analyze</p>
                        </div>
                        <button onClick={removeImage} className="p-2 text-slate-400 hover:text-red-500">
                            <span className="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all">
                            <span className="material-symbols-outlined text-primary text-3xl">photo_camera</span>
                            <span className="text-sm font-bold text-primary">Take Photo</span>
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all">
                            <span className="material-symbols-outlined text-indigo-500 text-3xl">image</span>
                            <span className="text-sm font-bold text-indigo-500">Upload</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MoodInputHome;