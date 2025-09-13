import { useState, useEffect } from 'react';
import toast from "react-hot-toast";
import { auth } from "../firebase/init";

export const useUserData = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserData({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                });
                setError(null);
            } else {
                setUserData(null);
                setError("No authenticated user found");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { userData, loading, error };
};