// @ts-nocheck
import React, { useState } from "react";
import { motion } from "framer-motion";
import { signInWithGoogle, signOutUser } from "../../firebase/auth";
import toast from "react-hot-toast";

// Authentication Button Component
export function AuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        console.log("User signed in:", result.user);
        toast.success("Successfully signed in!"), {
          duration: 4000,
          position: "middle-center",
        };
      } else {
        setError(result.error || null);
      }
    } catch (error) {
      setError("An unexpected error occurred during sign-in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="bg-white text-gray-800! px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-3 border border-gray-200"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400! border-t-transparent"></div>
            Signing in...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </>
        )}
      </motion.button>

      {error && (
        <p className="text-red-500 text-sm max-w-xs text-center">{error}</p>
      )}
    </div>
  );
}

// User Menu Component
export function UserMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOutUser();
    } catch (error) {
      console.error("Sign-out error:", error);
    } finally {
      setIsSigningOut(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white/20! backdrop-blur-md rounded-lg px-4 py-2 text-white hover:bg-white/30! transition-all"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || user.email}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-medium">
            {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden sm:block font-medium">
          {user.displayName || user.email}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden"
        >
          <div className="p-2">
            {/* <a
              href="/dashboard"
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </a>
            <a
              href="/profile"
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </a>
           
            <hr className="my-2 border-gray-200" /> */}
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 transition-colors"
            >
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
