'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const SignUpPage = dynamic(() => import('../../../views/SignUpPage'), { ssr: false });

export default function SignUpRoute() {
  return <SignUpPage />;
}
