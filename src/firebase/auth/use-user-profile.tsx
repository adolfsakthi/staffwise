
'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

// Define the shape of your user profile data stored in Firestore
export type UserProfile = {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  role: 'Admin' | 'Staff' | 'Manager'; // Example roles
  property_code: string;
};

/**
 * Hook to get the full user profile from Firestore.
 * It combines the auth user from `useUser` with the document from the `users` collection.
 */
export function useUserProfile() {
  const { user, isUserLoading: isAuthLoading, userError } = useUser();
  const firestore = useFirestore();

  // Create a memoized reference to the user's document in Firestore.
  // This prevents re-fetching the document on every render unless the user's UID changes.
  const userDocRef = useMemoFirebase(() => {
    if (firestore && user?.uid) {
      return doc(firestore, 'users', user.uid);
    }
    return null; // Return null if firestore or user is not available
  }, [firestore, user?.uid]);

  // Use the useDoc hook to fetch the user profile data in real-time.
  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userDocRef);

  return {
    user: user, // The raw Firebase Auth user object
    userProfile: userProfile, // The full profile data from Firestore
    isLoading: isAuthLoading || isProfileLoading, // True if either auth state or profile is loading
    error: userError || profileError, // Combines errors from both hooks
  };
}
