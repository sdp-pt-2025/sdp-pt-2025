// frontend/src/context/AuthProvider.jsx
import { auth } from "./firebase/init"; 
import { AuthContext } from "./context/AuthContext";
import { onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_PUBLIC_URL;

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [neonUser, setNeonUser] = useState(null);


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

      const response = await fetch(`${API_BASE_URL}/api/users`, {
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

  // Function to migrate existing Firebase user to Neon
  const migrateFirebaseUser = async (firebaseUser) => {
    try {
      // console.log(`🔄 Migrating Firebase user ${firebaseUser.uid} to Neon...`);
      
      const response = await fetch(`${API_BASE_URL}/api/users/${firebaseUser.uid}/migrate`, {
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
        throw new Error(errorData.error || 'Failed to migrate user');
      }

      const result = await response.json();
      // console.log(`✅ User migration ${result.migrated ? 'completed' : 'updated'}:`, result.message);
      return result.user;
    } catch (error) {
      console.error('Error migrating user:', error);
      throw error;
    }
  };

  // Function to get user from Neon 
  const getNeonUser = async (uid) => {
    try {
      // console.log(`🔍 Checking if user ${uid} exists in Neon database...`);
      
      const response = await fetch(`${API_BASE_URL}/api/users/${uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // console.log(`❌ User ${uid} not found in Neon database`);
          return null; // User doesn't exist in Neon
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch user from database`);
      }

      const userData = await response.json();
      // console.log(`✅ User ${uid} found in Neon database`);
      return userData;
    } catch (error) {
      console.error('Error fetching user from Neon:', error);
      return null;
    }
  };

  // Enhanced signup function
  const signUp = async (email, password, userData = {}) => {
    try {
      // Create in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create in Neon with provided data
      const neonUser = await createUserInNeon(firebaseUser, userData);
      setNeonUser(neonUser);

      return userCredential;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Function to update user profile
  const updateUserProfile = async (uid, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${uid}`, {
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

  // Function to update last login time
  const updateLastLogin = async (uid) => {
    try {
      await fetch(`${API_BASE_URL}/api/users/${uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastLoginAt: new Date().toISOString(),
        }),
      });
      // console.log(`✅ Updated last login for user ${uid}`);
    } catch (error) {
      console.error('Failed to update login time:', error);
    }
  };

  
  const checkUserProfileComplete = (userData) => {
    if (!userData) return false;
    
    return !(
      userData.faculty === 'Unknown' || 
      userData.studentId.startsWith('user_') ||
      userData.studentId.startsWith('migrated_') ||
      !userData.modules || 
      userData.modules.length === 0
    );
  };

 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // console.log("🔄 Auth state changed:", firebaseUser?.email || 'logged out');
      
      if (firebaseUser) {
        try {
          
          let userData = await getNeonUser(firebaseUser.uid);
          
          
          if (!userData) {
            // console.log('🔄 User not found in Neon, attempting migration...');
            try {
              userData = await migrateFirebaseUser(firebaseUser);
            } catch (migrationError) {
              console.error('❌ Migration failed:', migrationError);
              
              userData = await createUserInNeon(firebaseUser, {
                university: 'University of The Witwatersrand',
                faculty: 'Unknown',
                yearOfStudy: 1,
                modules: []
              });
            }
          } else {
            
            // console.log('🔄 Updating last login time...');
            await updateLastLogin(firebaseUser.uid);
          }

          setNeonUser(userData);
          
          
          const isProfileComplete = checkUserProfileComplete(userData);
          setUser({
            ...firebaseUser,
            needsProfileCompletion: !isProfileComplete,
            neonData: userData
          });
          
          // console.log(`✅ User ${firebaseUser.email} authenticated successfully`);
          // console.log(`📋 Profile complete: ${isProfileComplete}`);
          
        } catch (error) {
          console.error('❌ Error during auth state change:', error);
          
          setUser({
            ...firebaseUser,
            needsProfileCompletion: true,
            neonData: null,
            error: error.message
          });
          setNeonUser(null);
        }
      } else {
        // User logged out
        // console.log('👋 User logged out');
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
    getNeonUser,
    updateLastLogin,
    migrateFirebaseUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;