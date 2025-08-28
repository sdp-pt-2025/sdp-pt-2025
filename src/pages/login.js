import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { app } from "../firebase/firebase"; 
import {getDoc,query, collection, where, doc} from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const [username, setUsername] = useState(null);

  useEffect(() => {
    const savedName = localStorage.getItem("username");
    if (savedName) setUsername(savedName);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
/* 
      if (!user.email.endsWith("@students.wits.ac.za")) {
        alert("Only Wits student emails are allowed!");
        await signOut(auth);
        return;
      }
*/
      localStorage.setItem("username", user.displayName);
      localStorage.setItem("email", user.email);
      setUsername(user.displayName);

      //check if email exists
      
      try{
        const capture= await getDoc(doc(db,"Users",user.email));
        console.log(user.email);
        if(capture.exists()){
          navigate("/dashboard");
        }else{
          navigate("/userinfo");
        }
        
      }catch(error){
        console.log(error);

      }





    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    setUsername(null);
  };

  return (
    <section style={{ textAlign: "center", marginTop: "50px" }}>
     
        <button onClick={handleGoogleLogin}>Login with Google</button>
      
    </section>
  );
}
