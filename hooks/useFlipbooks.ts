import { openDB, DBSchema } from 'idb';
import { db, firebase } from '../firebase/config.ts'; // Import firebase for FieldValue

export interface Flipbook {
    id: number; // timestamp
    title: string;
    ownerId: string;
    ownerName?: string; // Storing this denormalized for the gallery
    pageUrls: string[]; // Array of data URLs
    public: boolean;
    createdAt: Date;
    views: number;
    likes: number;
    likedBy: string[]; // Array of user UIDs who liked
    folder?: string;
    isPremium: boolean;
    backgroundUrl?: string;
}

interface FlipbookDB extends DBSchema {
  flipbooks: {
    key: number;
    value: Flipbook;
    indexes: { 'by-owner': string, 'by-public': number };
  };
}

let dbPromise: any = null;

const getDB = () => {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<FlipbookDB>('flipbook-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('flipbooks', {
          keyPath: 'id',
        });
        store.createIndex('by-owner', 'ownerId');
        store.createIndex('by-public', 'public');
      },
    });
  }
  return dbPromise;
};

export const addFlipbook = async (flipbook: Omit<Flipbook, 'id' | 'views' | 'likes' | 'likedBy'>): Promise<number> => {
    const localDb = await getDB();
    if (!localDb) throw new Error("IndexedDB not available");
    const id = Date.now();
    const newFlipbook: Flipbook = {
        ...flipbook,
        id,
        views: 0,
        likes: 0,
        likedBy: [],
        folder: flipbook.folder || 'Default',
    };
    
    await localDb.add('flipbooks', newFlipbook);

    // Save to server JSON backup
    try {
        await fetch('/api/save-flipbook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newFlipbook),
        });
    } catch (e) {
        console.error("Failed to save copy to server:", e);
    }

    if (newFlipbook.public) {
        try {
            const firestoreFlipbook = {
                ...newFlipbook,
                createdAt: firebase.firestore.Timestamp.fromDate(newFlipbook.createdAt)
            };
            await db.collection('public_flipbooks').doc(String(id)).set(firestoreFlipbook);
        } catch (error) {
            console.error("Failed to save public flipbook to Firestore:", error);
        }
    }
    
    return id;
};

export const getFlipbook = async (id: number): Promise<Flipbook | undefined> => {
    // 1. Try loading from the server JSON backup first (most reliable, works in cross-origin iframes)
    try {
        const res = await fetch(`/uploads/flipbooks/${id}.json`);
        if (res.ok) {
            const serverBook = await res.json();
            if (serverBook && serverBook.createdAt) {
                serverBook.createdAt = new Date(serverBook.createdAt);
            }
            return serverBook;
        }
    } catch (error) {
        console.warn("Could not fetch flipbook from server uploads folder:", error);
    }

    // 2. Fallback to local IndexedDB
    try {
        const localDb = await getDB();
        if (localDb) {
            const localBook = await localDb.get('flipbooks', id);
            if (localBook) {
                if (localBook.createdAt && !(localBook.createdAt instanceof Date)) {
                    localBook.createdAt = new Date(localBook.createdAt as any);
                }
                return localBook;
            }
        }
    } catch (error) {
        console.warn("Could not access IndexedDB.", error);
    }
    
    // 3. Fallback to Firestore
    try {
        const docRef = db.collection('public_flipbooks').doc(String(id));
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data() as any;
            if (data.createdAt && data.createdAt.toDate) {
                data.createdAt = data.createdAt.toDate();
            }
            return data as Flipbook;
        }
    } catch (error) {
        console.error("Firestore get error:", error);
    }
    
    return undefined;
};

export const getFlipbooksForUser = async (userId: string): Promise<Flipbook[]> => {
    const localDb = await getDB();
    if (!localDb) return [];
    const allFlipbooks = await localDb.getAllFromIndex('flipbooks', 'by-owner', userId);
    return allFlipbooks.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
    });
};


export const getAllPublicFlipbooks = async (currentUserId?: string): Promise<Flipbook[]> => {
    try {
        const snapshot = await db.collection('public_flipbooks').orderBy('createdAt', 'desc').get();
        const firestoreBooks = snapshot.docs.map(doc => {
            const data = doc.data() as any;
             if (data.createdAt && data.createdAt.toDate) {
                data.createdAt = data.createdAt.toDate();
            }
            return data as Flipbook;
        });
        
        if(currentUserId) {
            const localBooks = await getFlipbooksForUser(currentUserId);
            const publicIds = new Set(firestoreBooks.map(fb => fb.id));
            const localOnlyBooks = localBooks.filter(fb => !publicIds.has(fb.id) && fb.public);
            return [...firestoreBooks, ...localOnlyBooks].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        return firestoreBooks;

    } catch (error) {
        console.error("Failed to fetch public flipbooks from Firestore, falling back to local.", error);
        const localDb = await getDB();
        if (!localDb) return [];
        const allFlipbooks = await localDb.getAll('flipbooks');
        return allFlipbooks
            .filter(fb => fb && (fb.public || fb.ownerId === currentUserId))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
};

export const updateFlipbookStats = async (id: number, type: 'views') => {
    const localDb = await getDB();
    if (!localDb) return;
    const flipbook = await localDb.get('flipbooks', id);
    let shouldUpdateFirestore = flipbook?.public;

    if (flipbook) {
        if (type === 'views') {
            flipbook.views = (flipbook.views || 0) + 1;
        }
        await localDb.put('flipbooks', flipbook);
    }

    if (shouldUpdateFirestore) {
        try {
            const docRef = db.collection('public_flipbooks').doc(String(id));
            await docRef.update({
                views: firebase.firestore.FieldValue.increment(1)
            });
        } catch (e) { 
             console.warn("Firestore stat update failed (might be unauthenticated):", e); 
        }
    }
};

export const hasLiked = async (id: number, userId: string): Promise<boolean> => {
    const flipbook = await getFlipbook(id);
    return flipbook?.likedBy?.includes(userId) || false;
};

export const toggleLike = async (id: number, userId: string) => {
    const localDb = await getDB();
    if (!localDb) return;
    const flipbook = await localDb.get('flipbooks', id);
    let wasLiked = false;

    if (flipbook) {
        const likedBy = flipbook.likedBy || [];
        const likedIndex = likedBy.indexOf(userId);
        wasLiked = likedIndex > -1;
        if (wasLiked) {
            flipbook.likes = Math.max(0, (flipbook.likes || 1) - 1);
            likedBy.splice(likedIndex, 1);
        } else {
            flipbook.likes = (flipbook.likes || 0) + 1;
            likedBy.push(userId);
        }
        flipbook.likedBy = likedBy;
        await localDb.put('flipbooks', flipbook);

        if (flipbook.public) {
            try {
                const docRef = db.collection('public_flipbooks').doc(String(id));
                await docRef.update({
                    likes: firebase.firestore.FieldValue.increment(wasLiked ? -1 : 1),
                    likedBy: wasLiked 
                        ? firebase.firestore.FieldValue.arrayRemove(userId)
                        : firebase.firestore.FieldValue.arrayUnion(userId)
                });
            } catch (e) {
                 console.error("Firestore like toggle failed", e);
            }
        }
    }
};

export const deleteFlipbook = async (id: number): Promise<void> => {
    const localDb = await getDB();
    if (!localDb) return;
    const flipbook = await localDb.get('flipbooks', id);
    if (flipbook && flipbook.public) {
        try {
            await db.collection('public_flipbooks').doc(String(id)).delete();
        } catch (error) {
            console.error("Failed to delete public flipbook from Firestore:", error);
        }
    }
    await localDb.delete('flipbooks', id);
};

export const updateFlipbook = async (flipbook: Flipbook): Promise<void> => {
    const localDb = await getDB();
    if (!localDb) return;
    await localDb.put('flipbooks', flipbook);

    if (flipbook.public) {
        try {
            const firestoreFlipbook = {
                ...flipbook,
                createdAt: firebase.firestore.Timestamp.fromDate(new Date(flipbook.createdAt))
            };
            await db.collection('public_flipbooks').doc(String(flipbook.id)).set(firestoreFlipbook, { merge: true });
        } catch (error) {
            console.error("Failed to update public flipbook in Firestore:", error);
        }
    }
};