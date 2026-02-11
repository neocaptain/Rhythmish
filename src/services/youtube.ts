import axios from 'axios';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export const getBrowserRegionCode = () => {
    try {
        const locale = navigator.language;
        if (locale && locale.includes('-')) {
            return locale.split('-')[1].toUpperCase();
        }
        return 'US'; // Default to KR
    } catch {
        return 'US';
    }
};

export interface YouTubeVideo {
    videoId: string;
    title: string;
    thumbnail: string;
    channelTitle: string;
}

export async function searchYouTubeVideo(query: string): Promise<YouTubeVideo | null> {
    if (!YOUTUBE_API_KEY) {
        console.warn("YouTube API Key is missing. Please add VITE_YOUTUBE_API_KEY to your .env.local file.");
        return null;
    }

    try {
        const url = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=1&type=video&key=${YOUTUBE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const item = data.items[0];
            const videoId = item.id.videoId;
            return {
                videoId: videoId,
                title: item.snippet.title,
                thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                channelTitle: item.snippet.channelTitle
            };
        }
        return null;
    } catch (error) {
        console.error("YouTube Search API Error:", error);
        return null;
    }
}

export const getTrendingMusic = async (regionCode: string = 'US') => {
    const CACHE_KEY = `trending_music_${regionCode}`;
    const CACHE_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

    try {
        // Check localStorage for cached data
        const cachedStr = localStorage.getItem(CACHE_KEY);
        if (cachedStr) {
            const cached = JSON.parse(cachedStr);
            const now = new Date().getTime();

            // If cache is still valid (less than 1 hour old), return it
            if (now - cached.timestamp < CACHE_TIME) {
                console.log(`Using cached YouTube data for region: ${regionCode}`);
                return cached.data;
            }
        }

        // Fetch fresh data if cache is missing or expired
        const response = await axios.get(`${BASE_URL}/videos`, {
            params: {
                part: 'snippet,statistics',
                chart: 'mostPopular',
                regionCode: regionCode,
                videoCategoryId: '10', // 'Music' category ID
                maxResults: 10,
                key: YOUTUBE_API_KEY,
            },
        });

        const items = response.data.items;

        // Save to localStorage with timestamp
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: new Date().getTime(),
            data: items
        }));

        return items;
    } catch (error) {
        console.error(`YouTube data loading Error (Region: ${regionCode})`, error);

        // Fallback to expired cache if it exists, otherwise return empty
        const cachedStr = localStorage.getItem(CACHE_KEY);
        if (cachedStr) {
            return JSON.parse(cachedStr).data;
        }
        return [];
    }
};