import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast'; // 1. Import Toaster
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

  const [lastInputType, setLastInputType] = useState<"text" | "gallery" | "camera">("text");
  const [lastInputText, setLastInputText] = useState<string>("");
  const [lastImageFile, setLastImageFile] = useState<File | undefined>(undefined);

  const handleAnalyze = async (text: string, imageFile?: File, type?: "text" | "gallery" | "camera") => {
    setState('ANALYSIS');
    setError(null);

    const inputType = type || (imageFile ? "camera" : "text");

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

  const handleShowFavorites = () => setState('FAVORITES');
  const handleShowDiscover = () => setState('DISCOVER');
  const handleShowProfile = () => setState('PROFILE');
  const handleShowMixtape = () => setState('MIXTAPE');

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
<<<<<<< Updated upstream
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      {/* 2. Add Toaster here for global availability */}
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'dark:bg-slate-800 dark:text-white',
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#1e1b4b',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600'
          }
        }}
      />

      <div className="app-container">
=======
    /* 1. all container: h-screen to fix height and flex-col to layout */
    <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col overflow-hidden">
      <Toaster position="top-center" />

      {/* 2. top area: only show when HOME, fixed height(shrink-0) */}
      {state === 'HOME' && (
        <header className="px-6 pt-6 pb-2 flex justify-between items-center shrink-0 z-50">
          <h1 className="text-xl font-black tracking-tighter text-primary">Rhythmish</h1>
          <div className="flex items-center gap-3">
            {user ? (
              <img src={user.photoURL || ''} alt="Profile" className="w-8 h-8 rounded-full border border-primary/20" />
            ) : (
              <button className="text-sm font-bold text-primary">Login</button>
            )}
          </div>
        </header>
      )}

      {/* 3. main content area: flex-1 to take up remaining space, internal scrolling */}
      <main className="flex-1 relative overflow-y-auto no-scrollbar">
>>>>>>> Stashed changes
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
                {/* 3. PersonalizedMixtape might need back functionality */}
                <PersonalizedMixtape
                  currentMoodResult={analysisResult?.emotions[0]?.label}
                  onBack={handleShowDiscover}
                />
              </div>
              {renderBottomNav()}
            </motion.div>
          )}
        </AnimatePresence>
<<<<<<< Updated upstream
      </div>
=======
      </main>
      {/* 4. bottom navigation: always fixed at bottom (hide when ANALYSIS) */}
      {state !== 'ANALYSIS' && (
        <nav className="shrink-0 z-50">
          {renderBottomNav()}
        </nav>
      )}
>>>>>>> Stashed changes
    </div>
  );
};

export default App;