'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // The FirebaseProvider now gets its instances from the global scope via its own imports.
  // We just need to render it.
  return (
    <FirebaseProvider>
      {children}
    </FirebaseProvider>
  );
}
