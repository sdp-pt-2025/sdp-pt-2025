import { createContext } from "react";

export const AuthContext = createContext({
  user: null,     // will hold Firebase user object or null
  loading: true,  // to track loading state
});
