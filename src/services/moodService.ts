import { db, auth, storage } from "./firebase";
import {
    collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp, Timestamp, orderBy, limit
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { getTimeAgo } from '../utils/dateUtils';
import { MOOD_DICTIONARY } from "../constants/moods";
import { analyzeMood, type AnalysisResult } from "./ai";

/**
 * 1. image compression and Storage upload function
 */
const uploadAndCompressImage = async (file: File, userId: string) => {
    try {
        // image compression options
        const options = {
            maxSizeMB: 1,          // max size 1MB
            maxWidthOrHeight: 1024, // max resolution 1024px
            useWebWorker: true
        };

        const compressedFile = await imageCompression(file, options);

        // storage path setting: mood_images/유저ID/타임스탬프_파일명
        const storageRef = ref(storage, `mood_images/${userId}/${Date.now()}_${file.name}`);

        // upload and return URL
        const snapshot = await uploadBytes(storageRef, compressedFile);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return { downloadURL, storagePath: snapshot.ref.fullPath };
    } catch (error) {
        console.error("image upload failed:", error);
        throw error;
    }
};

/**
 * 2. delete old data and images
 */
const cleanupOldData = async (userId: string) => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const oneMonthAgoTimestamp = Timestamp.fromDate(oneMonthAgo);

    const q = query(
        collection(db, "mood_history"),
        where("userId", "==", userId),
        where("createdAt", "<", oneMonthAgoTimestamp)
    );

    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map(async (document) => {
        const data = document.data();

        // if there is an image in storage, delete it
        if (data.storagePath) {
            const imageRef = ref(storage, data.storagePath);
            await deleteObject(imageRef).catch(err => console.error("image deletion failed:", err));
        }

        // delete Firestore document
        return deleteDoc(doc(db, "mood_history", document.id));
    });

    await Promise.all(deletePromises);
};

/**
 * 3. final storage function (Main)
 */
export const saveMoodResult = async (params: {
    userMood: { emotion: string; score: number }[],
    inputType: "text" | "gallery" | "camera",
    userInput: string,
    imageFile?: File | null
}) => {
    const user = auth.currentUser;
    if (!user) {
        console.error("user is not logged in");
        return;
    }

    try {
        console.log("start: cleaning up old data...");
        // delete old data and images
        await cleanupOldData(user.uid);

        let imageUrl = null;
        let storagePath = null;

        // if there is an image file, upload it
        if (params.imageFile) {
            console.log("start: image upload:", params.imageFile.name);
            const uploadResult = await uploadAndCompressImage(params.imageFile, user.uid);
            imageUrl = uploadResult.downloadURL;
            storagePath = uploadResult.storagePath;
            console.log("end: image upload:", imageUrl);
        }

        // Firestore save data log
        console.log("Firestore save data:", {
            userId: user.uid,
            userMood: params.userMood,
            inputType: params.inputType,
            userInput: params.userInput
        });

        // save to Firestore
        const docRef = await addDoc(collection(db, "mood_history"), {
            userId: user.uid,
            userMood: params.userMood,
            inputType: params.inputType,
            userInput: params.userInput,
            imageUrl: imageUrl,       // public URL (for display)
            storagePath: storagePath, // storage path (for deletion)
            createdAt: serverTimestamp()
        });

        console.log("mood result saved successfully. document ID:", docRef.id);
    } catch (error: any) {
        // detailed error log
        console.error("❌ saving process failed detailed cause:");
        console.error("error message:", error.message);
        console.error("error code:", error.code);
        console.error("error object:", error);
    }
};

export const getPersonalizedMessage = async (manualMood?: string) => {
    const user = auth.currentUser;
    if (!user) return "Welcome! Let's find your rhythm.";

    try {
        // 1. Get current mood (either from manual input or latest history)
        let currentMood = manualMood;
        if (!currentMood) {
            const moodQuery = query(
                collection(db, "mood_history"),
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc"),
                limit(1)
            );
            const moodSnapshot = await getDocs(moodQuery);
            currentMood = !moodSnapshot.empty
                ? moodSnapshot.docs[0].data().userMood[0].emotion
                : "Peaceful";
        }

        // 2. Fetch the most recent liked song
        const likedQuery = query(
            collection(db, "liked_songs"),
            where("userId", "==", user.uid),
            orderBy("likedAt", "desc"),
            limit(1)
        );
        const likedSnapshot = await getDocs(likedQuery);

        if (likedSnapshot.empty) {
            return `Since you're feeling ${currentMood} today, I've curated a special rhythm for you!`;
        }

        const lastSongData = likedSnapshot.docs[0].data();
        const timeAgo = getTimeAgo(lastSongData.likedAt.toDate());
        const lastSongMood = lastSongData.mood || "";

        // 3. Logic based on Mood Categories (Scalable approach)
        const currentCat = MOOD_DICTIONARY[currentMood!]?.category || "neutral";
        const lastCat = MOOD_DICTIONARY[lastSongMood]?.category || "neutral";

        let vibeCheck = "I've tuned into your vibration to find the perfect tracks.";

        if (currentCat === "positive" && lastCat === "positive") {
            vibeCheck = "Keep that amazing energy flowing! I've picked more to brighten your day.";
        } else if (currentCat === "negative" && lastCat === "negative") {
            vibeCheck = "It's okay to feel this way. I've found some calm melodies to sit with you in this moment.";
        } else if (currentCat === "negative" && lastCat === "positive") {
            vibeCheck = "Things seem a bit heavy today. Let's find some gentle rhythms to help you recharge.";
        } else if (currentCat === "positive" && lastCat === "negative") {
            vibeCheck = "I'm so glad to see your vibe brightening up! Let's keep this momentum with some upbeat picks.";
        }

        return `Because you liked "${lastSongData.title}" ${timeAgo} and feel ${currentMood} today, ${vibeCheck}`;

    } catch (error) {
        console.error("Failed to generate personalized message:", error);
        return "Discover the perfect rhythm for your mood today!";
    }
};

export const getPersonalizedMixtape = async (manualMood?: string): Promise<{ message: string; result: AnalysisResult | null }> => {
    try {
        const message = await getPersonalizedMessage(manualMood);

        const user = auth.currentUser;
        if (!user) return { message, result: null };

        const moodQuery = query(
            collection(db, "mood_history"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(1)
        );
        const moodSnapshot = await getDocs(moodQuery);
        const currentMood = manualMood || (!moodSnapshot.empty ? moodSnapshot.docs[0].data().userMood[0].emotion : "Peaceful");

        const likedQuery = query(
            collection(db, "liked_songs"),
            where("userId", "==", user.uid),
            orderBy("likedAt", "desc"),
            limit(1)
        );
        const likedSnapshot = await getDocs(likedQuery);
        const lastSong = !likedSnapshot.empty ? likedSnapshot.docs[0].data() : null;

        const aiPrompt = `
          The user is currently feeling ${currentMood}.
          ${lastSong ? `Their most recently liked song is "${lastSong.title}" by ${lastSong.artist}.` : "They haven't liked any songs yet."}
          Please provide exactly 5 song recommendations that would fit this context well.
          The headline and summary should reflect this personalization.
        `;

        const result = await analyzeMood(aiPrompt);
        return { message, result };
    } catch (error) {
        console.error("Failed to get personalized mixtape:", error);
        return {
            message: "Welcome back! Here's some music for you.",
            result: null
        };
    }
};