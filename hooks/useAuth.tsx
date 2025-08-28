"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"
import {
  type User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { auth, db, googleProvider, isFirebaseReady, firebaseError } from "@/lib/firebase"

// Extend Firebase User with custom fields
export interface AppUser extends FirebaseUser {
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
}

interface AuthContextType {
  user: AppUser | null
  loading: boolean
  error: string | null
  firebaseReady: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  updateUserProfile: (data: any) => Promise<void>
  retryFirebaseInit: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initRetries, setInitRetries] = useState(0)

  const checkFirebaseStatus = () => {
    const ready = isFirebaseReady()

    if (!ready) {
      const errorMsg = firebaseError || "Firebase services not available"
      setError(errorMsg)
      console.error("Firebase not ready:", errorMsg)
      return false
    }

    setError(null)
    return true
  }

  const retryFirebaseInit = () => {
    setInitRetries((prev) => prev + 1)
    setLoading(true)
    setError(null)

    // Force a re-check after a short delay
    setTimeout(() => {
      if (checkFirebaseStatus()) {
        setupAuthListener()
      } else {
        setLoading(false)
      }
    }, 1000)
  }

  const setupAuthListener = () => {
    if (!auth) {
      setError("Firebase Auth not initialized")
      setLoading(false)
      return
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
          if (user && db) {
            // Update user's last seen timestamp
            await updateDoc(doc(db, "users", user.uid), {
              lastSeen: serverTimestamp(),
              isOnline: true,
            }).catch((err) => {
              console.warn("Failed to update user status:", err)
            })
          }
          setUser(user)
          setError(null)
        } catch (err) {
          console.error("Auth state change error:", err)
          setError((err as Error).message)
        } finally {
          setLoading(false)
        }
      })

      return unsubscribe
    } catch (err) {
      console.error("Failed to set up auth listener:", err)
      setError("Failed to initialize authentication")
      setLoading(false)
    }
  }

  useEffect(() => {
    // Wait a bit for Firebase to initialize
    const initTimer = setTimeout(() => {
      if (checkFirebaseStatus()) {
        const unsubscribe = setupAuthListener()
        return () => unsubscribe?.()
      } else {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(initTimer)
  }, [initRetries])

  const signUp = async (email: string, password: string, name: string) => {
    if (!auth) throw new Error("Firebase Auth not available")
    if (!db) throw new Error("Firebase Firestore not available")

    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(user, { displayName: name })

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
      isOnline: true,
      subscriberCount: 0,
      videoCount: 0,
      totalViews: 0,
      bio: "",
      location: "",
      isVerified: false,
    })
  }

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth not available")
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase Auth not available")

    const { user } = await signInWithPopup(auth, googleProvider)

    if (db) {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: user.displayName || "Google User",
          email: user.email,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          lastSeen: serverTimestamp(),
          isOnline: true,
          subscriberCount: 0,
          videoCount: 0,
          totalViews: 0,
          bio: "",
          location: "",
          isVerified: false,
          provider: "google",
        })
      }
    }
  }

  const logout = async () => {
    if (!auth) throw new Error("Firebase Auth not available")

    if (user && db) {
      await updateDoc(doc(db, "users", user.uid), {
        isOnline: false,
        lastSeen: serverTimestamp(),
      }).catch((err) => {
        console.warn("Failed to update logout status:", err)
      })
    }

    await signOut(auth)

    // Clear any local storage data
    localStorage.removeItem("watchHistory")

    // Redirect to home page after logout
    window.location.href = "/"
  }

  const updateUserProfile = async (data: any) => {
    if (!db || !user) throw new Error("Firebase not available")

    try {
      // Update Firestore document
      await updateDoc(doc(db, "users", user.uid), {
        ...data,
        updatedAt: serverTimestamp(),
      })

      // Update Firebase Auth profile if name is being changed
      if (data.name && auth && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: data.name,
        })
      }

      // Trigger a re-fetch of user data
      const updatedUser = { ...user }
      if (data.name) updatedUser.displayName = data.name
      setUser(updatedUser)
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    error,
    firebaseReady: isFirebaseReady(),
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    updateUserProfile,
    retryFirebaseInit,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
