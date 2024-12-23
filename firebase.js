import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
} from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";

// Firebase configuration from .env
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Sanitize URL to be used as a Firestore document ID
 * @param {string} url - The URL to sanitize
 * @returns {string} - Sanitized URL suitable for Firestore document ID
 */
function sanitizeUrlForDocumentId(url) {
  // Extract the part after 'software/'
  const match = url.match(/\/software\/(.+)$/);
  if (match && match[1]) {
    return match[1]
      .replace(/[^a-zA-Z0-9_-]/g, "") // Remove any other special characters
      .substring(0, 256); // Firestore has a 256-character limit
  }

  // Fallback to previous method if no match
  return url
    .replace(/^https?:\/\//, "") // Remove http:// or https://
    .replace(/\//g, "_") // Replace remaining slashes with underscores
    .replace(/[^a-zA-Z0-9_-]/g, "") // Remove any other special characters
    .substring(0, 256); // Firestore has a 256-character limit
}

/**
 * Write project data to Firestore
 * @param {Object} projectData - The project data to write
 * @returns {Promise} - Promise resolving to the Firestore document reference
 */
export async function writeProjectToFirestore(projectData) {
  try {
    // Add timestamp to project data
    const projectWithTimestamp = {
      ...projectData,
      timestamp: serverTimestamp(),
    };

    // Sanitize URL for document ID
    const sanitizedUrl = sanitizeUrlForDocumentId(projectData.post_url);

    // Use sanitized post_url as the document ID to avoid duplicates
    const docRef = await setDoc(
      doc(db, "brainrot_winners", sanitizedUrl),
      projectWithTimestamp
    );

    console.log("Project written with sanitized URL: ", sanitizedUrl);
    return docRef;
  } catch (error) {
    console.error("Error writing project to Firestore: ", error);
    throw error;
  }
}

export {
  db,
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  serverTimestamp,
};
