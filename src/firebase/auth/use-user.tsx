'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, query, collection, where, getDocs } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

interface UseUserResult {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  propertyCode: string | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export function useUser(): UseUserResult {
  const auth = useAuth();
  const firestore = useFirestore();
  
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        setFirebaseUser(user);
        setIsUserLoading(false);
      }, 
      (error) => {
        setUserError(error);
        setIsUserLoading(false);
      }
    );
    return () => unsubscribe();
  }, [auth]);

  // Once we have a Firebase user, we fetch their profile from Firestore
  const userProfileQuery = useMemoFirebase(() => {
    if (!firestore || !firebaseUser) return null;
    // We query the 'users' collection to find the document with the matching uid
    return query(collection(firestore, 'users'), where('uid', '==', firebaseUser.uid));
  }, [firestore, firebaseUser]);

  // We need to use getDocs here because we are querying a collection.
  // useDoc is for a direct document reference.
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!userProfileQuery) {
        setProfileLoading(false);
        setUserProfile(null);
        return;
    };

    setProfileLoading(true);
    getDocs(userProfileQuery).then(snapshot => {
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            setUserProfile({ id: doc.id, ...doc.data() } as UserProfile);
        } else {
            setUserProfile(null);
        }
        setProfileLoading(false);
    }).catch(error => {
        console.error("Error fetching user profile:", error);
        setUserError(error);
        setProfileLoading(false);
    });

  }, [userProfileQuery]);


  return {
    user: firebaseUser,
    userProfile,
    propertyCode: userProfile?.property_code || null,
    isUserLoading: isUserLoading || (!!firebaseUser && profileLoading),
    userError,
  };
}
