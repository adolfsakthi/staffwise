'use client';

import { useMemo } from 'react';
import { FirebaseProvider, initializeFirebase } from '.';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const GSSPSnapshot = useMemo(() => initializeFirebase(), []);
  return <FirebaseProvider {...GSSPSnapshot}>{children}</FirebaseProvider>;
}
