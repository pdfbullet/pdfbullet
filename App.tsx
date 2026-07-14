'use client';

import { createContext } from 'react';

export const LayoutContext = createContext<{
    setShowFooter: (show: boolean) => void;
}>({
    setShowFooter: () => { },
});

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    url?: string;
    imageBase64?: string;
    attachmentUrl?: string;
}

export default function App() {
  return null;
}