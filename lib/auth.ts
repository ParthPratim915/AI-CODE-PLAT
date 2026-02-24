/**
 * Authentication helper functions
 * 
 * This module provides utility functions for authentication operations.
 * All role checks fetch from Firestore - never trust client-only state.
 * No UI logic is included here - these are pure server/client utilities.
 */

import { auth } from './firebase';
import { firestore } from './firebase';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

/**
 * User profile interface matching Firestore schema exactly
 */
export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'candidate';
  createdAt: any; // Firestore Timestamp
}

/**
 * Get the current authenticated user from Firebase Auth
 * Returns null if no user is authenticated
 * 
 * This is a client-side function. For server-side auth checks,
 * use Firebase Admin SDK with session cookies (to be implemented).
 */
export async function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

/**
 * Require authentication
 * Throws an error if no user is authenticated
 * 
 * @throws {Error} If user is not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

/**
 * Get current user's profile from Firestore
 * Fetches the complete user profile including role
 * 
 * @returns User profile or null if not found/not authenticated
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    return await getUserProfile(user.uid);
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    return null;
  }
}

/**
 * Get user profile from Firestore by user ID
 * Uses exact Firestore schema: uid, email, role, createdAt
 * 
 * @param userId - Firebase Auth user ID
 * @returns User profile matching Firestore schema or null if not found
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(firestore, 'users', userId));
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      
      // Validate and return profile matching exact schema
      return {
        uid: data.uid || userId,
        email: data.email || '',
        role: data.role === 'admin' ? 'admin' : 'candidate', // Default to candidate if invalid
        createdAt: data.createdAt,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Get user role from Firestore
 * Fetches role from /users/{userId} document
 * Always fetches from Firestore - never trusts client state
 * 
 * @param userId - Firebase Auth user ID
 * @returns User role ('admin' | 'candidate') or null if not found
 */
export async function getUserRole(userId: string): Promise<'admin' | 'candidate' | null> {
  try {
    const profile = await getUserProfile(userId);
    return profile?.role || null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

/**
 * Check if current user is an admin
 * Fetches role from Firestore - never trusts client state
 * 
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const profile = await getCurrentUserProfile();
    return profile?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Check if a specific user is an admin
 * Fetches role from Firestore - never trusts client state
 * 
 * @param userId - Firebase Auth user ID
 * @returns true if user is admin, false otherwise
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const role = await getUserRole(userId);
    return role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}
