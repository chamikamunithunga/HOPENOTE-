import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

export async function fetchOneDriveLinks() {
  const q = query(
    collection(db, "oneDriveLinks"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function checkDuplicateOneDriveLink(url) {
  try {
    const normalizedUrl = url.trim().toLowerCase();
    const allLinks = await fetchOneDriveLinks();
    return allLinks.some((link) => {
      const existingUrl = (link.url || "").trim().toLowerCase();
      return existingUrl === normalizedUrl;
    });
  } catch (error) {
    console.error("Error checking duplicate OneDrive link:", error);
    return false;
  }
}


