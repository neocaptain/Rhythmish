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
import { auth, googleProvider } from './services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import type { AnalysisResult } from './services/ai';

type AppState = 'HOME' | 'ANALYSIS' | 'RESULT' | 'RECOMMENDATIONS' | 'FAVORITES' | 'DISCOVER' | 'PROFILE' | 'MIXTAPE';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('HOME');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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
    /* 1. all container: h-screen to fix height and flex-col to layout */
    <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col overflow-hidden">
      <Toaster position="top-center" />

      {/* 2. top area: only show when HOME, fixed height(shrink-0) */}
      {state === 'HOME' && (
        <header className="px-6 pt-6 pb-2 flex justify-between items-center shrink-0 z-50">
          <div className="flex items-center gap-3">
            <div className="size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="aspect-square size-full object-cover" />
              ) : (
                <div className="bg-slate-200 dark:bg-slate-700 size-full flex items-center justify-center">
                  <span className="material-symbols-outlined">person</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user ? "Welcome back" : "Welcome"}</p>
              <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">{user ? `Hi ${user.displayName?.split(' ')[0]} 👋` : "Guest"}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <button onClick={handleLogout} className="flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 transition-colors">
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            ) : (
              <button onClick={handleLogin} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors">Login</button>
            )}
          </div>
        </header>
      )}

      {/* 3. main content area: flex-1 to take up remaining space, internal scrolling */}
      <main className="flex-1 relative overflow-y-auto no-scrollbar">
        {error && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-red-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {state === 'HOME' && (
            <motion.div key="home" className="min-h-full">
              <MoodInputHome onAnalyze={handleAnalyze} />
            </motion.div>
          )}

          {state === 'ANALYSIS' && (
            <motion.div key="analysis" className="min-h-full">
              <MoodAnalysis
                onComplete={handleAnalysisComplete}
                onCancel={handleBackToHome}
              />
            </motion.div>
          )}

          {state === 'RESULT' && analysisResult && (
            <motion.div key="result" className="min-h-full">
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
            <motion.div key="recommendations" className="min-h-full">
              <RecommendedSongs
                result={analysisResult}
                onBack={() => setState('RESULT')}
                onRefresh={handleBackToHome}
              />
            </motion.div>
          )}

          {state === 'FAVORITES' && (
            <motion.div key="favorites" className="min-h-full">
              <div className="flex-1 overflow-hidden">
                <FavoriteSongs
                  onBack={handleBackToHome}
                />
              </div>
            </motion.div>
          )}

          {state === 'DISCOVER' && (
            <motion.div key="discover" className="min-h-full">
              <div className="flex-1 overflow-hidden">
                <Discover onShowMixtape={handleShowMixtape} />
              </div>
            </motion.div>
          )}

          {state === 'PROFILE' && (
            <motion.div key="profile" className="min-h-full">
              <Profile onBack={handleBackToHome} />
            </motion.div>
          )}

          {state === 'MIXTAPE' && (
            <motion.div key="mixtape" className="min-h-full">
              <PersonalizedMixtape
                currentMoodResult={analysisResult?.emotions[0]?.label}
                onBack={handleShowDiscover}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {/* 4. bottom navigation: always fixed at bottom (hide when ANALYSIS) */}
      {state !== 'ANALYSIS' && (
        <nav className="shrink-0 z-50">
          {renderBottomNav()}
        </nav>
      )}
    </div>
  );
};

export default App;