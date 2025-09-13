// frontend/src/context/AuthProvider.jsx
import { auth } from "./firebase/init";
import { AuthContext } from "./context/AuthContext";
import { onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";


const API_BASE_URL = import.meta.env.VITE_API_URL ;

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [neonUser, setNeonUser] = useState(null);

  // Function to create user in Neon via Express API
  const createUserInNeon = async (firebaseUser, additionalData = {}) => {
    try {
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        photoURL: firebaseUser.photoURL || null,
        
        university: additionalData.university || 'University of The Witwatersrand',
        studentId: additionalData.studentId || `user_${firebaseUser.uid.substring(0, 8)}`,
        yearOfStudy: additionalData.yearOfStudy || 1,
        faculty: additionalData.faculty || 'Unknown',
        modules: additionalData.modules || [],
        lastLoginAt: new Date().toISOString(),
        isActive: true,
        ...additionalData 
      };

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user in database');
      }

      const result = await response.json();
      return result.user;
    } catch (error) {
      console.error('Error creating user in Neon:', error);
      throw error;
    }
  };

  // Function to get user from Neon
  const getNeonUser = async (uid) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${uid}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // User doesn't exist in Neon
        }
        throw new Error('Failed to fetch user from database');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user from Neon:', error);
      return null;
    }
  };

  // Function to migrate existing user to Neon (gradual migration)
  const migrateExistingUser = async (firebaseUser) => {
    try {
      console.log(`Checking if user ${firebaseUser.email} exists in Neon...`);
      
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUser.uid}/migrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Migration failed');
      }

      const result = await response.json();
      console.log(result.message);
      
      return result.user;
    } catch (error) {
      console.error('Error during user migration:', error);
     
      return null;
    }
  };

  //the code below come from firebase docs.

  // Enhanced signup function
  const signUp = async (email, password, userData = {}) => {
    try {
      // Create in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create in Neon with provided data
      const neonUser = await createUserInNeon(firebaseUser, userData);
      setNeonUser(neonUser);
      console.log(userCredential, "for neon", neonUser, "- neon user")

      return userCredential;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Function to update user profile
  const updateUserProfile = async (uid, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const result = await response.json();
      setNeonUser(result.user);
      
      return result.user;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Function to check if user needs profile completion
  const checkUserProfileComplete = (userData) => {
    if (!userData) return false;
    
    return !(
      userData.faculty === 'Unknown' || 
      userData.studentId.startsWith('user_') ||
      userData.studentId.startsWith('migrated_') ||
      !userData.modules.length
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser?.email || 'logged out');
      
      if (firebaseUser) {
        try {
          // First, try to get existing user from Neon
          let userData = await getNeonUser(firebaseUser.uid);
          
          // If user doesn't exist in Neon, migrate them
          if (!userData) {
            console.log('User not found in Neon, migrating...');
            userData = await migrateExistingUser(firebaseUser);
          } else {
            
            await fetch(`${API_BASE_URL}/users/${firebaseUser.uid}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                lastLoginAt: new Date().toISOString(),
              }),
            }).catch(err => console.error('Failed to update login time:', err));
          }

          setNeonUser(userData);
          
          // Add profile completion status to user object
          const isProfileComplete = checkUserProfileComplete(userData);
          setUser({
            ...firebaseUser,
            needsProfileCompletion: !isProfileComplete,
            neonData: userData
          });
          
        } catch (error) {
          console.error('Error during auth state change:', error);
          // Still set the Firebase user even if Neon operations fail
          setUser({
            ...firebaseUser,
            needsProfileCompletion: true,
            neonData: null
          });
          setNeonUser(null);
        }
      } else {
        setUser(null);
        setNeonUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    neonUser,
    loading,
    signUp,
    createUserInNeon,
    updateUserProfile,
    checkUserProfileComplete,
    getNeonUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;