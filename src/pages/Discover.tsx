import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getTrendingMusic, getBrowserRegionCode } from '../services/youtube';

interface DiscoverProps {
    onShowMixtape: () => void;
}

const Discover: React.FC<DiscoverProps> = ({ onShowMixtape }) => {
    const [trendingVideos, setTrendingVideos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const region = getBrowserRegionCode();
                const data = await getTrendingMusic(region);
                setTrendingVideos(data);
            } catch (error) {
                console.error("Failed to fetch trending videos:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrending();
    }, []);

    const communityMoods = [
        // ... (rest of communityMoods remains)
        {
            title: "Rainy Day Melodies",
            desc: "Soft piano & lo-fi",
            listeners: "2.4k",
            grad: "from-blue-900/60 to-primary/40",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDrksx3Lfy94Fb3AiTQYSc1wAKREFR2rtUZ6BWhAIap7oqRNXhoVVJf4dD5XnGinaXSDHQbY1y6495onCYLLMG0L7DM9PG5aBTDLWCl9Cg_BarLfdzuJXVWnHKDC2c94wQvqO_URScKQSBvPXVMFoz_VQvHdyfBPPbWfimW6up3xlbCDW8nEbcFfqjclKcM0ZncNYt5LXOdu0-IsPB3aUf_V4pZoE2uGPxGST_1IVVzti2Aj5TYlZ_fxhbwTaA1akvoUjDgO1pEbFQx"
        },
        {
            title: "Late Night Vibes",
            desc: "Deep house & techno",
            listeners: "8.1k",
            grad: "from-indigo-900/60 to-purple-800/40",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCgmYkx8iXmssXKikrC_oIHf6ixlHdGFgvgTQfvCkK-km0Y56__mePet6vRw2ElUFG1k94rdbWxGZhl407VFiTMFSBx0sCvHugtEGq5qyAHxyqpQWPWSqf797QgAj1_z_NqRXWXWPkwVhxHIDkEgvjfWWGjMarQVztMZC8OejEmynzNsiJEca0bjdS5aql1QLo6NAqckUZjX70fCsgiGXui8tonFA2iyl882SUqxaHPD1x-1HqvMfe3dG8KZY6Oox7dp8cYFgOhyES"
        },
        {
            title: "Deep Focus",
            desc: "Ambient soundscapes",
            listeners: "1.2k",
            grad: "from-primary/60 to-slate-900/40",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCiGrTDqdBQN-Xt2KjDNMOxUxLUe7lys8qj8W008Dni7Qb_TDvEPY1NzvGTSTJFCgS7PWly5qMhwC4Kry7FJzN-QLo20rI7fwD7EKeY8rU7ct3AEwnUzYOHbp9-OkZcw6PDrxVUZpgmSzIvqORotti1v32bHTM5vSUEBWfqgNRse6vEHo-EPSq4DEGjukRiGapin1IIcyAAS6zqYaCrM3eEAAmuZh1tzp3L9PHycVOltU0lbhX_hOK_VTyJiC6IvXdRU46ZIWfuW1Yp"
        },
        {
            title: "Golden Nostalgia",
            desc: "80s & 90s classics",
            listeners: "450",
            grad: "from-orange-900/60 to-primary/40",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAubU4SkxnAJSCi8OrcfjvNyQQEuU6Ob3pH9gWRN7hCzX5YjSTxhcFi0hDtfPfpo7cwiJoW-u_4goPHByPpqvnR4VnJiL8IkcpgKRCPr-nXD8-Ma0jzxMBU1YKadkfG4ncG3SEhJGRl4uv4iKFPg8L_nri2W3hR1wumpT0egA1xQve3FABh94zuueO7_2UAH2yPSUlJgB8HGQ2sHdW5unLDGF8P9ytls2MbWYhGuSeSUafH3KdA7FBjrlYBmfpRSLRVwHziF6X4n7ED"
        }
    ];

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 overflow-y-auto no-scrollbar pb-24">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-primary/10">
                <h1 className="text-2xl font-bold tracking-tight">Discover</h1>
                <div className="flex items-center gap-4">
                    <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">search</span>
                    </button>
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
                        <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAF7XDm_-t5Yi7TeC7Gr8I0rjgxQPbuMp32YRDQXN6MUAsJt5ugPt4o68O0Cv5QHaH3DpcuSu6PKasH7g0OokMb3tlvknQLuO0600RiiLH1-WIwRdammKm1i2uYX-8EVZUrlgjI0mlCmrpf7NLPxHDjMFcJE54wHcvdxu2DcG2LE7jejv9eWufGbzOGVDvYrvi2sSVRnVOauCFFd4FkAxf9FeVVkoGh95awDqtWEBpvsL_hk3-nmi9sVn4ZHaEfBUz9zK8A-ArAVIBW" />
                    </div>
                </div>
            </header>

            {/* Trending Now on YouTube Section */}
            <section className="mt-6">
                <div className="px-6 flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-primary material-symbols-outlined">trending_up</span>
                        Trending on YouTube
                    </h2>
                    <button className="text-primary text-sm font-semibold">View All</button>
                </div>
                <div className="flex overflow-x-auto pb-4 gap-4 px-6 no-scrollbar snap-x">
                    {isLoading ? (
                        // Loading Skeletons
                        [1, 2, 3].map((i) => (
                            <div key={i} className="flex-none w-80 snap-start animate-pulse">
                                <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl mb-3"></div>
                                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                            </div>
                        ))
                    ) : (
                        trendingVideos.map((video) => (
                            <div key={video.id} className="flex-none w-80 snap-start">
                                <div className="relative group rounded-xl overflow-hidden mb-3 aspect-video shadow-lg">
                                    <img
                                        alt={video.snippet.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        src={video.snippet.thumbnails.high.url}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full px-2 py-1">
                                        <span className="text-[10px] font-bold text-white flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs text-red-500 fill-1">visibility</span>
                                            {video.statistics?.viewCount
                                                ? (parseInt(video.statistics.viewCount) > 1000000
                                                    ? (parseInt(video.statistics.viewCount) / 1000000).toFixed(1) + 'M'
                                                    : (parseInt(video.statistics.viewCount) / 1000).toFixed(0) + 'K')
                                                : '0'
                                            }
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
                                        className="absolute inset-0 m-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="material-symbols-outlined text-3xl fill-1">play_arrow</span>
                                    </button>
                                </div>
                                <h3 className="font-bold text-lg leading-tight truncate">{video.snippet.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    {video.snippet.channelTitle} • {new Date(video.snippet.publishedAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* AI Mood Recommendation Banner */}
            <div className="px-6 py-4">
                <div className="bg-primary rounded-xl p-4 flex items-center justify-between text-white shadow-lg shadow-primary/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined">auto_awesome</span>
                        </div>
                        <div>
                            <h4 className="font-bold">Personalized Discovery</h4>
                            <p className="text-white/80 text-xs">AI has selected 5 new songs for your vibe.</p>
                        </div>
                    </div>
                    <button
                        onClick={onShowMixtape}
                        className="bg-white text-primary px-3 py-1.5 rounded-lg text-sm font-bold active:scale-95 transition-transform"
                    >
                        Tune In
                    </button>
                </div>
            </div>

            {/* Community Moods Section */}
            <section className="mt-4 px-6 pb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-primary material-symbols-outlined">bubble_chart</span>
                        Real-time Moods
                    </h2>
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        LIVE
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {communityMoods.map((mood, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5 }}
                            className="relative aspect-square rounded-xl overflow-hidden group shadow-md"
                        >
                            <img alt={mood.title} className="w-full h-full object-cover" src={mood.image} />
                            <div className={`absolute inset-0 bg-gradient-to-br ${mood.grad}`}></div>
                            <div className="absolute inset-0 p-4 flex flex-col justify-between">
                                <span className="self-start px-2 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[10px]">person</span> {mood.listeners} listening
                                </span>
                                <div>
                                    <h3 className="text-white font-bold text-lg leading-tight">{mood.title}</h3>
                                    <p className="text-white/70 text-[10px] uppercase font-bold tracking-wider">{mood.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Discover;
