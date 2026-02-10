// Mood image service - returns high-quality images based on mood keywords
// Uses direct Unsplash image URLs (no API key required)

const DEFAULT_MOOD_IMAGE = 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&auto=format&fit=crop&q=80';

const moodImageMap: Record<string, string> = {
    // Happy/Positive
    'happy': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    'joyful': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    'smile': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    'cheerful': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',

    // Sad/Melancholic
    'sad': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80',
    'melancholic': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80',
    'wistful': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    'nostalgic': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    'bittersweet': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop&q=80',
    'lonely': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop&q=80',

    // Energetic/Active
    'energetic': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    'excited': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
    'motivated': 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&auto=format&fit=crop&q=80',
    'dynamic': 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&auto=format&fit=crop&q=80',

    // Calm/Peaceful
    'calm': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    'peaceful': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80',
    'serene': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop&q=80',
    'tranquil': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80',

    // Anxious/Stressed
    'anxious': 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?w=800&auto=format&fit=crop&q=80',
    'stressed': 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?w=800&auto=format&fit=crop&q=80',
    'tense': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',

    // Romantic/Love
    'romantic': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80',
    'loving': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80',

    // Focus/Productivity
    'focused': 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&auto=format&fit=crop&q=80',
    'productive': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
};

export async function getMoodImageDetailed(mood: string): Promise<string> {
    try {
        const lowerMood = mood.toLowerCase();
        console.log('Searching for mood image. Headline:', mood, 'Lowercase:', lowerMood);

        for (const [key, url] of Object.entries(moodImageMap)) {
            if (lowerMood.includes(key)) {
                console.log(`✅ Mood matched! Keyword: "${key}" -> Image URL: ${url.substring(0, 50)}...`);
                return url;
            }
        }

        // No match found, return default image
        console.log('⚠️ No mood keyword matched. Using default image.');
        return DEFAULT_MOOD_IMAGE;
    } catch (error) {
        console.error("Failed to get mood image:", error);
        return DEFAULT_MOOD_IMAGE;
    }
}

// Legacy function for compatibility
export async function getMoodImage(mood: string): Promise<string> {
    return getMoodImageDetailed(mood);
}
