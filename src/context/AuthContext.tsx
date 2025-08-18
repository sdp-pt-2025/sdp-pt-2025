import type { User } from "firebase/auth";
import { createContext } from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean; // Add loading
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true, // Add default loading state
});
