"use client";
import { auth } from "@/firebase/init";
import { AuthContext } from "@/context/AuthContext";
import { onAuthStateChanged, type User } from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean; // Add loading state
}

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed in provider:", user); // Debug log
      setUser(user);
      setLoading(false); // Set loading to false after auth check
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <div>{children}</div>
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = (): AuthContextType => {
  const context = useContext<AuthContextType>(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default Provider;
