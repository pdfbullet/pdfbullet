'use client';

import { usePathname } from 'next/navigation';

export default function CanonicalHeader() {
  const pathname = usePathname();
  
  // Normalize the canonical URL to always use the primary root domain (without www)
  const canonicalUrl = `https://pdfbullet.com${pathname === '/' ? '' : pathname}`;

  return (
    <link rel="canonical" href={canonicalUrl} />
  );
}
