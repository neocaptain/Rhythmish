import { motion } from 'framer-motion';
import { useTrendingTrack } from '../hooks/useTrendingTrack';

const MoodTrendCard = ({ mood, idx }: { mood: any, idx: number }) => {
    // 1. 각 카드별 감정 레이블에 맞는 트렌딩 곡을 가져옵니다.
    // mood.title이 'Joyful' 등 DB의 moodLabel과 일치해야 합니다.
    const trendingTrack = useTrendingTrack(mood.title);

    // 데이터가 없을 때 보여줄 Fallback 정보
    const defaultTrack = {
        title: "Discovering...",
        artist: "Rhythmish Trend",
        cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100"
    };

    const trackToShow = trendingTrack || defaultTrack;

    return (
        <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="relative aspect-[4/5] rounded-2xl overflow-hidden group shadow-lg"
        >
            <img alt={mood.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={mood.image} />
            <div className={`absolute inset-0 bg-gradient-to-b ${mood.grad} opacity-80`}></div>

            <div className="absolute inset-0 p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <span className="px-2 py-1 bg-black/20 backdrop-blur-md rounded-full text-[9px] font-bold text-white flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px] fill-[1]">group</span> {mood.listeners}
                    </span>
                </div>

                <div className="space-y-2">
                    <div>
                        <h3 className="text-white font-black text-xl leading-tight">{mood.title}</h3>
                        <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider">{mood.desc}</p>
                    </div>

                    {/* 2. 실제 로직이 적용된 미니 노출 영역 */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-2 border border-white/10 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-300 shrink-0 overflow-hidden">
                            <motion.img
                                key={trackToShow.title}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={trackToShow.cover}
                                alt="song"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-black text-white truncate">{trackToShow.title}</p>
                            <p className="text-[8px] text-white/60 truncate">{trackToShow.artist}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MoodTrendCard;
