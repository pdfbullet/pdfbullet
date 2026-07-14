'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const FlipbookLandingPage = dynamic(() => import('../../../flipbooks/FlipbookLandingPage'), { ssr: false });

export default function FlipbooksRoute() {
  return <FlipbookLandingPage />;
}
