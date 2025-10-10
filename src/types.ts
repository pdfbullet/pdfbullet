import React, { createContext } from 'react';

export interface Tool {
  id: string;
  title: string;
  description: string;
  Icon: React.FC<{ className?: string }>;
  color: string;
  hoverColor: string;
  textColor: string;
  isNew?: boolean;
  isPremium?: boolean;
  category?: 'organize' | 'optimize' | 'convert-from' | 'convert-to' | 'security' | 'edit' | 'business';
  accept?: Record<string, string[]>;
  api?: {
    category: 'pdf' | 'image' | 'signature' | 'utility';
  };
  fileTypeDisplayName?: string;
  fileTypeNounPlural?: string;
}

// FIX: Moved LayoutContext here to break a circular dependency between App.tsx and ToolPage.tsx.
export const LayoutContext = createContext<{
  setShowFooter: (show: boolean) => void;
}>({
  setShowFooter: () => {},
});