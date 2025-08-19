// @ts-nocheck
// firebase/auth.ts - Authentication functions
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/firebase/init";

import React, { useState } from "react";

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("profile");
googleProvider.addScope("email");

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;

    console.log("Google sign-in successful:", user);
    return { success: true, user };
  } catch (error: any) {
    console.error("Google sign-in error:", error);

    // Handle specific error codes
    let errorMessage = "Failed to sign in with Google";

    switch (error.code) {
      case "auth/popup-closed-by-user":
        errorMessage = "Sign-in was cancelled";
        break;
      case "auth/popup-blocked":
        errorMessage = "Popup was blocked by browser";
        break;
      case "auth/cancelled-popup-request":
        errorMessage = "Another popup is already open";
        break;
      case "auth/network-request-failed":
        errorMessage = "Network error. Please check your connection";
        break;
      default:
        errorMessage = error.message || "Failed to sign in with Google";
    }

    return { success: false, error: errorMessage };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error("Email sign-in error:", error);

    let errorMessage = "Failed to sign in";

    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "No account found with this email";
        break;
      case "auth/wrong-password":
        errorMessage = "Incorrect password";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address";
        break;
      case "auth/user-disabled":
        errorMessage = "This account has been disabled";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many failed attempts. Please try again later";
        break;
      default:
        errorMessage = error.message || "Failed to sign in";
    }

    return { success: false, error: errorMessage };
  }
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string
) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }

    return { success: true, user: result.user };
  } catch (error: any) {
    console.error("Email sign-up error:", error);

    let errorMessage = "Failed to create account";

    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "An account with this email already exists";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address";
        break;
      case "auth/weak-password":
        errorMessage = "Password should be at least 6 characters";
        break;
      default:
        errorMessage = error.message || "Failed to create account";
    }

    return { success: false, error: errorMessage };
  }
};

// Send password reset email
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    console.error("Password reset error:", error);

    let errorMessage = "Failed to send reset email";

    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "No account found with this email";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address";
        break;
      default:
        errorMessage = error.message || "Failed to send reset email";
    }

    return { success: false, error: errorMessage };
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error("Sign-out error:", error);
    return { success: false, error: error.message || "Failed to sign out" };
  }
};

interface AuthenticationProps {
  children: React.ReactNode;
}

function Authentication({ children }: AuthenticationProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      const result = await signInWithGoogle();

      if (result.success) {
        console.log("User signed in:", result.user);
      } else {
        console.error("Sign-in failed:", result.error);

        alert(result.error);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={handleGoogleSignIn}
      className={`${
        isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {children}
    </div>
  );
}

export { Authentication };
