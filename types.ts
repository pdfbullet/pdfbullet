
import React from 'react';

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