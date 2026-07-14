import { useState, useEffect, useCallback } from 'react';
import { getDb } from './useLastTasks.ts'; // Import the shared DB instance

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

const STORE_NAME = 'signedDocuments';

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
