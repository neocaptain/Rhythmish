import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth } from '../services/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getPersonalizedMessage } from "../services/moodService";

const MixtapePage = ({ currentMoodResult }: { currentMoodResult?: string }) => {
    const [personalMsg, setPersonalMsg] = useState("Tuning into your rhythm...");

    useEffect(() => {
        const fetchMessage = async () => {
            // execute getPersonalizedMessage even if there is no argument
            const msg = await getPersonalizedMessage(currentMoodResult);
            setPersonalMsg(msg);
        };
        fetchMessage();
    }, [currentMoodResult]);

    return (
        <p className="text-lg leading-snug text-slate-700 dark:text-slate-200">
            {personalMsg}
            <span className="material-symbols-outlined text-sm align-middle ml-1 fill-1 text-primary">auto_awesome</span>
        </p>
    );
};

const PersonalizedMixtape: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const tracks = [
        {
            title: "Ethereal Drift",
            artist: "Lumina Sounds",
            match: "98%",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkmtRNvNR2oD9pYRIZMYinRFVP6CD6-qd9iXALcERkl22AfmeTdNJ6mHjq3ip1aafUT6aP5c6TBC8S0Z_QwYlkmiycbUwvwIhhL4VXD8U2tUHxomgxF-ieXI8NszMhiHbYabj0lHPK_hWZE7e1AyLOljGUQUVRwTv3vk5GLsKSo3axv7obStXpuygLFpgmYMZNwo23mU7svXxInbIme8dSMEJfn7_QiWresn5RO_oSZv9ovxXX_YfidHQUiay7bcj9dMfeflKbbo4j"
        },
        {
            title: "Midnight Velvet",
            artist: "Satin Waves",
            match: "94%",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZiitX8NHHmjD91I6REpq6y1Mxf84WeqzTVLw4VlBrkhTrZR0d021qi4gjzZ7cvwPM7ns2kYahQHLi_8XgwAOJguh3DkV5lmO7chJSYuPyB-xiVOJgj6B6KEahVXuJXFuoJ3iBWivKHCZKU6hteCUtxPbMGkW6fzNz0Z2IFTCMz8DbEy7oglYmCqLt4qyL4oGHl-Hn40hgkM9o1BqQKyh2-9F6jkUfajYJkmh65gxFYnpaLchMKslP1-0uFZet6KHRk_7bMBzOCjVW"
        },
        {
            title: "Neon Petals",
            artist: "The Flutter Project",
            match: "92%",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZdcL5_-PqU_axwRn-Si8JZkxtNNgxIN4HfH39BKU_w8QI-dtRAkwPt1Hn7Fd3JXfPNjhWbVKn4ap-YKix98xxsBO-H9hJVfeuIF5QVw1vqag3BbtAdyy5UWjGyAx4ZRPHgEiMkJPb0Ex8GBcT5HVeQgjZgRnomHCW4HvVGLmeTwYXaOgyCK1kxyQkwmnetWEuFRi7VgeYbR5y2mjBdRl2UOsD51MZjZSsB8sVRF8nQN2wXgfIXZz0XPARlPiRdEFsZ9LtYYvJv2wi"
        },
        {
            title: "Digital Bloom",
            artist: "Circuit Garden",
            match: "89%",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuATElxbTsuZVJKi6CiGWuuFMzfQ90-Ns_UE_XlqSR0f6NxJjJcJkgblAX1gl7hi5BgSpZ-R8ibp8B-x5yd_E_AGMSWOF7qwDMz0nnWL2ZbPnt8X4ovn5PGo7gApylcCDhJ2omaD-iABO1BxlXRH9Kw71MBTiYTZVntqLQqy9VUiC7HTZtpVCd03Ck-FX2A8dMPCM5Iie7DkpEdpLkiG59Q_yEdfCfzKJE3G4h7WC9r9516sgWx3VLJGNfAxNdiKuyHHvNkjFz02eSjH"
        },
        {
            title: "Starlight Echo",
            artist: "Nova Kid",
            match: "85%",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYXt3xhLeTrw3vwzvuuyYa1v180Cb00ICmAVc-cHLFIKuzrZzFdvc1CaD48Evs_ZAxaTkKinBmzkLUzg_tO9shsfo5rzVTkjEpGLZmH5tScI-tJXvkQy0O0RpRF29Pyx0_SuO_6SyHguBmNF0tj_BmmQQElfbejqPyMBo2RLO3BYZNU1MdBATZzuksaj9ssqcCEEnROXXskc_0tnNnJYOBaiiCueRk1obmWt3jXio65S5Fit-dTFHu6B7A1nLEOvGMR1h75TsmowDf"
        }
    ];

    return (
        <div className="relative flex-1 flex flex-col overflow-hidden">
            {/* Background Gradient Mesh */}
            <div className="absolute top-0 left-0 w-full h-full gradient-mesh pointer-events-none z-0"></div>

            <main className="flex-1 overflow-y-auto no-scrollbar z-10 px-6 pb-28">
                <header className="pt-6 pb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                                <span className="material-symbols-outlined text-white text-xl fill-1">auto_awesome</span>
                            </div>
                            <h1 className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">Rhytmix</h1>
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-primary/30 p-0.5 overflow-hidden">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="bg-slate-200 dark:bg-slate-700 w-full h-full flex items-center justify-center rounded-full">
                                    <span className="material-symbols-outlined text-slate-400">person</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-2xl p-5 mb-8 border-l-4 border-l-primary shadow-xl shadow-primary/5"
                    >
                        {/* execute getPersonalizedMessage even if there is no argument */}
                        <MixtapePage />
                    </motion.div>

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-primary/80">Your Personal Mix</h2>
                        <span className="text-xs text-slate-400 font-medium">{tracks.length} Tracks</span>
                    </div>
                </header>

                <div className="space-y-4">
                    {tracks.map((track, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card rounded-xl p-3 flex items-center gap-4 group active:scale-[0.98] transition-all relative cursor-pointer"
                        >
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-white text-3xl fill-1">play_arrow</span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base truncate text-slate-900 dark:text-white">{track.title}</h3>
                                <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-1">{track.match} Match</span>
                                <div className="flex items-center gap-1">
                                    <button className="p-1.5 hover:bg-primary/10 rounded-full transition-colors">
                                        <span className="material-symbols-outlined text-primary text-xl">favorite</span>
                                    </button>
                                    <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                                        <span className="material-symbols-outlined text-slate-400 text-xl">more_vert</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-10 mb-6 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Powered by YouTube & Rhytmix AI</p>
                </div>
            </main>
        </div>
    );
};

export default PersonalizedMixtape;
