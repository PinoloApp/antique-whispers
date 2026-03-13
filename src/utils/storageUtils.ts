import { ref, uploadString, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import { storage } from "@/firebase/firebase";

/**
 * Uploads a base64 image string to Firebase Storage.
 * @param base64String The base64 string (data URL)
 * @param path The path in storage where the image should be saved
 * @returns The download URL of the uploaded image
 */
export const uploadBase64Image = async (base64String: string, path: string): Promise<string> => {
    if (!base64String.startsWith('data:image')) return base64String; // Already a URL or raw path
    const storageRef = ref(storage, path);
    await uploadString(storageRef, base64String, 'data_url');
    return await getDownloadURL(storageRef);
};

/**
 * Deletes a file from Firebase Storage given its download URL.
 * @param url The download URL of the file
 */
export const deleteStorageFile = async (url: string): Promise<void> => {
    if (!url || !url.includes('firebasestorage')) return;
    try {
        const fileRef = ref(storage, url);
        await deleteObject(fileRef);
    } catch (e) {
        console.warn(`Failed to delete storage file: ${url}`, e);
    }
};

/**
 * Deletes all files within a folder in Firebase Storage.
 * @param folderPath The path to the folder
 */
export const deleteStorageFolder = async (folderPath: string): Promise<void> => {
    try {
        const folderRef = ref(storage, folderPath);
        const files = await listAll(folderRef);
        await Promise.all(files.items.map((item) => deleteObject(item)));
    } catch (e) {
        console.warn(`Failed to delete storage folder: ${folderPath}`, e);
    }
};
