import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export interface Emotion {
  label: string;
  value: number;
  color: string;
  icon: string;
}

export interface SongRecommendation {
  id: string;
  title: string;
  artist: string;
  matchScore: number;
  emotions: Emotion[]; // Breakdown for this specific song
  tags: string[];
  youtubeVideoId: string; // YouTube video ID for thumbnail generation
  thumbnail: string; // Deprecated, will be generated from youtubeVideoId
  duration: string;
  searchQuery: string;
}

export interface AnalysisResult {
  headline: string;
  emotions: Emotion[];
  recommendations: SongRecommendation[];
  summary: string;
}

export async function analyzeMood(userInput: string, imageFile?: File): Promise<AnalysisResult> {
  // Fallback to gemini-pro/vision as 1.5-flash is returning 404
  // const modelName = imageFile ? "gemini-1.5-flash" : "gemini-pro";
  // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  // Try writing 'models/gemini-1.5-flash' instead of 'gemini-1.5-flash'.
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    Analyze the following user mood description ${imageFile ? "and the provided image" : ""} and provide a structured JSON response for a music recommendation app called "Rhythmish".
    User Input: "${userInput}"

    The JSON must follow this exact structure:
    {
      "headline": "A short, catchy headline describing the mood (e.g., 'A bit nostalgic but hopeful')",
      "summary": "A one-sentence poetic analysis of why these songs were chosen (e.g., 'Your input suggests warm sunset hues...')",
      "emotions": [
        { "label": "Joy", "value": 30, "color": "text-yellow-400", "icon": "sentiment_very_satisfied" },
        { "label": "Calm", "value": 70, "color": "text-blue-400", "icon": "water_drop" },
        { "label": "Nostalgia", "value": 45, "color": "text-orange-400", "icon": "history" }
      ],
      "recommendations": [
        {
          "id": "1",
          "title": "Song Title",
          "artist": "Artist Name",
          "matchScore": 99,
          "emotions": [
             { "label": "Joy", "value": 25, "color": "text-yellow-400", "icon": "sentiment_very_satisfied" },
             { "label": "Calm", "value": 75, "color": "text-blue-400", "icon": "water_drop" },
             { "label": "Nostalgia", "value": 40, "color": "text-orange-400", "icon": "history" }
          ],
          "tags": ["#Tag1", "#Tag2"],
          "youtubeVideoId": "11-character-id",
          "thumbnail": "",
          "duration": "3:45",
          "searchQuery": "Artist - Song Title official audio"
        }
      ]
    }

    Choose exactly 3 emotions that best fit the mood.
    Provide 3-5 song recommendations.
    
    CRITICAL INSTRUCTIONS for Emotion Matching:
    1. For each song in 'recommendations', provide an 'emotions' array that uses the EXACT SAME 3 'label' names as the top-level 'emotions' array.
    2. The 'value' for each emotion in a song should represent how much that specific song embodies that emotion.
    3. The 'matchScore' should be a reflection of how closely the song's emotion values align with the user's emotion values.

    CRITICAL INSTRUCTIONS for YouTube recommendations:
    1. Only recommend REAL, well-known songs that exist on YouTube.
    2. Always provide a perfect 'searchQuery' (e.g., 'Artist Name - Song Title official music video') that reflects the headline and emotions discovered.
    3. The 'searchQuery' should be optimized for YouTube search to find the most relevant official video or high-quality audio.
    4. Leave 'youtubeVideoId' as an empty string - the system will fetch it using your search query via YouTube API.
    5. Leave 'thumbnail' as an empty string.
    
    Each song MUST have different metadata.
    Ensure matchScore values vary between songs (e.g., 95%, 88%, 82%).
    Return ONLY the raw JSON string.
  `;

  try {
    let result;
    if (imageFile) {
      const imagePart = await fileToGenerativePart(imageFile);
      result = await model.generateContent([prompt, imagePart]);
    } else {
      result = await model.generateContent(prompt);
    }
    const response = await result.response;
    const text = response.text();

    // Extract JSON if it's wrapped in markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response as JSON");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
}

async function fileToGenerativePart(file: File) {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.readAsDataURL(file);
  });
}
