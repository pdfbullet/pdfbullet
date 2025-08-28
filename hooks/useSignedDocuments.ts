import { useState, useEffect, useCallback } from 'react';

export interface SignedDocument {
    id: number; // timestamp
    originator: string;
    originalFile: Blob;
    originalFileName: string;
    signedFile: Blob;
    signedFileName: string;
    signers: { name: string; signedAt: string; }[];
    status: 'Signed';
    createdAt: number; // timestamp
    auditTrail: string; // JSON string of audit events
}

const DB_NAME = 'ilovepdflyDB'; // Using same DB as useLastTasks, but new store
const DB_VERSION = 2; // Bump version to add new store
const STORE_NAME = 'signedDocuments';
const LAST_TASKS_STORE_NAME = 'lastTasks';


let dbPromise: Promise<IDBDatabase> | null = null;

const getDb = (): Promise<IDBDatabase> => {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(LAST_TASKS_STORE_NAME)) {
                    db.createObjectStore(LAST_TASKS_STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    }
    return dbPromise;
};

export const useSignedDocuments = () => {
    const [documents, setDocuments] = useState<SignedDocument[]>([]);
    const [loading, setLoading] = useState(true);

    const loadDocuments = useCallback(async () => {
        setLoading(true);
        try {
            const db = await getDb();
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const allDocs = await new Promise<SignedDocument[]>((resolve, reject) => {
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });
            setDocuments(allDocs.sort((a, b) => b.createdAt - a.createdAt));
        } catch (error) {
            console.error("Failed to load signed documents from IndexedDB", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    const addSignedDocument = useCallback(async (doc: Omit<SignedDocument, 'id' | 'createdAt'>) => {
        const now = Date.now();
        const newDoc: SignedDocument = {
            ...doc,
            id: now,
            createdAt: now,
        };
        try {
            const db = await getDb();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            await new Promise<void>((resolve, reject) => {
                const req = store.add(newDoc);
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
            });
            await loadDocuments();
        } catch (error) {
            console.error("Failed to add signed document to IndexedDB", error);
        }
    }, [loadDocuments]);
    
    const deleteSignedDocument = useCallback(async (id: number) => {
        try {
            const db = await getDb();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            await new Promise<void>((resolve, reject) => {
                const req = store.delete(id);
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
            });
            await loadDocuments();
        } catch (error) {
            console.error("Failed to delete signed document from IndexedDB", error);
        }
    }, [loadDocuments]);


    return { documents, loading, addSignedDocument, deleteSignedDocument };
};
