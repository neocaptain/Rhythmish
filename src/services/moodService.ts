import { db, auth, storage } from "./firebase";
import {
    collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp, Timestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import imageCompression from "browser-image-compression";

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
    if (!user) return;

    try {
        // delete old data and images
        await cleanupOldData(user.uid);

        let imageUrl = null;
        let storagePath = null;

        // if there is an image file, upload it
        if (params.imageFile) {
            const uploadResult = await uploadAndCompressImage(params.imageFile, user.uid);
            imageUrl = uploadResult.downloadURL;
            storagePath = uploadResult.storagePath;
        }

        // save to Firestore
        await addDoc(collection(db, "mood_history"), {
            userId: user.uid,
            userMood: params.userMood,
            inputType: params.inputType,
            userInput: params.userInput,
            imageUrl: imageUrl,       // public URL (for display)
            storagePath: storagePath, // storage path (for deletion)
            createdAt: serverTimestamp()
        });

        console.log("mood result saved successfully.");
    } catch (error) {
        console.error("saving process failed:", error);
        alert("result saving failed.");
    }
};