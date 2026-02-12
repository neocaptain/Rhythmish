import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MoodInputHome from './pages/MoodInputHome';
import MoodAnalysis from './pages/MoodAnalysis';
import EmotionResult from './pages/EmotionResult';
import RecommendedSongs from './pages/RecommendedSongs';
import FavoriteSongs from './pages/FavoriteSongs';
import Discover from './pages/Discover';
import Profile from './pages/Profile';
import PersonalizedMixtape from './pages/PersonalizedMixtape';
import { analyzeMood } from './services/ai';
import type { AnalysisResult } from './services/ai';

type AppState = 'HOME' | 'ANALYSIS' | 'RESULT' | 'RECOMMENDATIONS' | 'FAVORITES' | 'DISCOVER' | 'PROFILE' | 'MIXTAPE';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('HOME');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // analysis metadata storage state
  const [lastInputType, setLastInputType] = useState<"text" | "gallery" | "camera">("text");
  const [lastInputText, setLastInputText] = useState<string>("");
  const [lastImageFile, setLastImageFile] = useState<File | undefined>(undefined);

  const handleAnalyze = async (text: string, imageFile?: File, type?: "text" | "gallery" | "camera") => {
    setState('ANALYSIS');
    setError(null);

    // type is passed, set it to camera if there is an image, otherwise set it to text
    const inputType = type || (imageFile ? "camera" : "text");

    // state update (this value is passed to EmotionResult)
    setLastInputType(inputType);
    setLastInputText(text);
    setLastImageFile(imageFile);

    console.log(`analysis start - type: ${inputType}, image existence: ${!!imageFile}`);

    try {
      const result = await analyzeMood(text, imageFile);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError("AI analysis failed. Please try again.");
      setState('HOME');
    }
  };

  const handleAnalysisComplete = () => {
    if (analysisResult) {
      setState('RESULT');
    }
  };

  const handleShowRecommendations = () => {
    setState('RECOMMENDATIONS');
  };

  const handleBackToHome = () => {
    setState('HOME');
    setAnalysisResult(null);
  };

  const handleShowFavorites = () => {
    setState('FAVORITES');
  };

  const handleShowDiscover = () => {
    setState('DISCOVER');
  }

  const handleShowProfile = () => {
    setState('PROFILE');
  }

  const handleShowMixtape = () => {
    setState('MIXTAPE');
  }

  const renderBottomNav = () => (
    <div className="flex items-center justify-around border-t border-slate-100 dark:border-white/5 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 pb-8 shrink-0">
      <button
        onClick={() => setState('HOME')}
        className={`flex flex-col items-center gap-1 transition-colors ${state === 'HOME' ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
      >
        <span className={`material-symbols-outlined ${state === 'HOME' ? 'fill-[1]' : ''}`}>home</span>
        <span className="text-[10px] font-bold">Home</span>
      </button>
      <button
        onClick={handleShowDiscover}
        className={`flex flex-col items-center gap-1 transition-colors ${state === 'DISCOVER' ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
      >
        <span className={`material-symbols-outlined ${state === 'DISCOVER' ? 'fill-[1]' : ''}`}>explore</span>
        <span className="text-[10px] font-medium">Discover</span>
      </button>
      <button
        onClick={handleShowFavorites}
        className={`flex flex-col items-center gap-1 transition-colors ${state === 'FAVORITES' ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
      >
        <span className={`material-symbols-outlined ${state === 'FAVORITES' ? 'fill-[1]' : ''}`}>favorite</span>
        <span className="text-[10px] font-medium">Favorites</span>
      </button>
      <button
        onClick={handleShowProfile}
        className={`flex flex-col items-center gap-1 transition-colors ${state === 'PROFILE' ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
      >
        <span className={`material-symbols-outlined ${state === 'PROFILE' ? 'fill-[1]' : ''}`}>person</span>
        <span className="text-[10px] font-medium">Profile</span>
      </button>
    </div>
  );


  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <div className="app-container">
        {error && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium">
            {error}
          </div>
        )}
        <AnimatePresence mode="wait">
          {state === 'HOME' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col"
            >
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <MoodInputHome onAnalyze={handleAnalyze} />
              </div>
              {renderBottomNav()}
            </motion.div>
          )}

          {state === 'ANALYSIS' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <MoodAnalysis
                onComplete={handleAnalysisComplete}
                onCancel={handleBackToHome}
              />
            </motion.div>
          )}

          {state === 'RESULT' && analysisResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <EmotionResult
                result={analysisResult}
                onShowRecommendations={handleShowRecommendations}
                onBack={handleBackToHome}
                imageFile={lastImageFile}
                inputType={lastInputType}
                userInputText={lastInputText}
              />

            </motion.div>
          )}

          {state === 'RECOMMENDATIONS' && analysisResult && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="h-full"
            >
              <RecommendedSongs
                result={analysisResult}
                onBack={() => setState('RESULT')}
                onRefresh={handleBackToHome}
              />
            </motion.div>
          )}

          {state === 'FAVORITES' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col"
            >
              <div className="flex-1 overflow-hidden">
                <FavoriteSongs
                  onBack={handleBackToHome}
                />
              </div>
              {renderBottomNav()}
            </motion.div>
          )}

          {state === 'DISCOVER' && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col"
            >
              <div className="flex-1 overflow-hidden">
                <Discover onShowMixtape={handleShowMixtape} />
              </div>
              {renderBottomNav()}
            </motion.div>
          )}

          {state === 'PROFILE' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="h-full flex flex-col"
            >
              <div className="flex-1 overflow-hidden">
                <Profile onBack={handleBackToHome} />
              </div>
              {renderBottomNav()}
            </motion.div>
          )}

          {state === 'MIXTAPE' && (
            <motion.div
              key="mixtape"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="h-full flex flex-col"
            >
              <div className="flex-1 overflow-hidden">
                <PersonalizedMixtape />
              </div>
              {renderBottomNav()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
