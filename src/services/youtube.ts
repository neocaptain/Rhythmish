
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

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
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=1&type=video&key=${YOUTUBE_API_KEY}`;
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
