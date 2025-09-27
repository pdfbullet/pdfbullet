import { useState, useEffect, useCallback } from 'react';

export interface LastTask {
    id: number; // timestamp used as unique key
    toolId: string;
    toolTitle: string;
    outputFilename: string;
    timestamp: number;
    fileBlob: Blob;
}

const DB_NAME = 'pdfbulletDB';
const DB_VERSION = 2;
const TASK_STORE_NAME = 'lastTasks';
const SIGNED_DOCS_STORE_NAME = 'signedDocuments';

let dbPromise: Promise<IDBDatabase> | null = null;

export const getDb = (): Promise<IDBDatabase> => {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(TASK_STORE_NAME)) {
                    db.createObjectStore(TASK_STORE_NAME, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(SIGNED_DOCS_STORE_NAME)) {
                    db.createObjectStore(SIGNED_DOCS_STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    }
    return dbPromise;
};

export const useLastTasks = () => {
    const [tasks, setTasks] = useState<LastTask[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTasks = useCallback(async () => {
        setLoading(true);
        try {
            const db = await getDb();
            const tx = db.transaction(TASK_STORE_NAME, 'readonly');
            const store = tx.objectStore(TASK_STORE_NAME);
            const allTasks = await new Promise<LastTask[]>((resolve, reject) => {
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });
            setTasks(allTasks.sort((a, b) => b.timestamp - a.timestamp));
        } catch (error) {
            console.error("Failed to load tasks from IndexedDB", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const cleanupOldTasks = useCallback(async () => {
        try {
            const db = await getDb();
            const tx = db.transaction(TASK_STORE_NAME, 'readwrite');
            const store = tx.objectStore(TASK_STORE_NAME);
            const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
            
            const req = store.openCursor();
            req.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor) {
                    if (cursor.value.timestamp < twoHoursAgo) {
                        store.delete(cursor.primaryKey);
                    }
                    cursor.continue();
                }
            };
             await new Promise<void>((resolve, reject) => {
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        } catch (error) {
            console.error("Failed to cleanup old tasks", error);
        }
    }, []);

    useEffect(() => {
        cleanupOldTasks().then(loadTasks);
    }, [loadTasks, cleanupOldTasks]);

    const addTask = useCallback(async (task: Omit<LastTask, 'id' | 'timestamp'>) => {
        const now = Date.now();
        const newTask: LastTask = {
            ...task,
            id: now,
            timestamp: now
        };
        try {
            const db = await getDb();
            const tx = db.transaction(TASK_STORE_NAME, 'readwrite');
            const store = tx.objectStore(TASK_STORE_NAME);
            await new Promise<void>((resolve, reject) => {
                const req = store.add(newTask);
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
            });
            await loadTasks();
        } catch (error) {
            console.error("Failed to add task to IndexedDB", error);
        }
    }, [loadTasks]);

    const deleteTask = useCallback(async (id: number) => {
        try {
            const db = await getDb();
            const tx = db.transaction(TASK_STORE_NAME, 'readwrite');
            const store = tx.objectStore(TASK_STORE_NAME);
            await new Promise<void>((resolve, reject) => {
                const req = store.delete(id);
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
            });
            await loadTasks();
        } catch (error) {
            console.error("Failed to delete task from IndexedDB", error);
        }
    }, [loadTasks]);

    return { tasks, loading, addTask, deleteTask };
};
