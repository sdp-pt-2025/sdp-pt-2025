import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage,db } from "../firebase/firebase"; 
import { getAuth } from "firebase/auth";
import { setDoc ,doc, collection} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../css/avatar.css"

export default function Avatar(){
  const navigate= useNavigate();
      const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  const auth = getAuth();
  const user = auth.currentUser;

  let email=localStorage.getItem("email");
    
    const avatars=[
"https://plus.unsplash.com/premium_vector-1719858610584-14eae64834af?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
"https://plus.unsplash.com/premium_vector-1727955579185-ed12a1c678de?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
"https://images.unsplash.com/vector-1740737650825-1ce4f5377085?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXZhdGFyfGVufDB8fDB8fHww",
"https://plus.unsplash.com/premium_vector-1682269282372-6d888f3451f1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww",
"https://plus.unsplash.com/premium_vector-1682269287900-d96e9a6c188b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YXZhdGFyfGVufDB8fDB8fHww",
"https://plus.unsplash.com/premium_vector-1727955579176-073f1c85dcda?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXZhdGFyfGVufDB8fDB8fHww",
"https://plus.unsplash.com/premium_vector-1721131162314-e72dfe634cd0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
"https://plus.unsplash.com/premium_vector-1721131162956-142b85adbd24?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
"https://plus.unsplash.com/premium_vector-1721131162397-943dc390c744?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
"https://images.unsplash.com/vector-1751454198115-e9be0467eb64?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
"https://images.unsplash.com/vector-1750077867665-0e6fed5749e6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
"https://plus.unsplash.com/premium_vector-1719858610474-deaa7f76017c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzd8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
"https://plus.unsplash.com/premium_vector-1719858610627-4b70cc15a340?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
"https://plus.unsplash.com/premium_vector-1719858611500-a0584aa51355?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDJ8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
"https://images.unsplash.com/vector-1742828270468-bf8f66495c78?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDR8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
"https://plus.unsplash.com/premium_vector-1722167430205-008209add65e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDl8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
"https://images.unsplash.com/vector-1743527707507-70631351d4da?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDh8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
"https://images.unsplash.com/vector-1742828279123-1be593020ecd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
"https://images.unsplash.com/vector-1742828264271-3ebf9c62a2b6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTZ8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
"https://images.unsplash.com/vector-1742828285190-0ed4c03f2ee6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjR8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",


    ];


    const avatar_click=async(e)=>{
        let id=e.target.id;
        try{
          await setDoc(doc(db,"Users",email,"Profile_Picture","main"),{
            image:id
          });
          navigate("/dashboard");
        }catch(error){
          console.log(error,"hiiiiiiii");
        }


    }


    const handleUpload = async () => {
    if (!image || !user) return;

    const imageRef = ref(storage, `users/${user.uid}/profile.jpg`);
    await uploadBytes(imageRef, image);
    const downloadURL = await getDownloadURL(imageRef);
    setUrl(downloadURL);

    try{
          await setDoc(doc(db,"Users",email,"Profile_Picture","main"),{
            image:downloadURL
          });
          navigate("/dashboard");
        }catch(error){
          console.log(error);
        }

    
    console.log("Profile picture uploaded:", downloadURL);
  };

 const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result); 
      reader.readAsDataURL(file);
    }
  };


return(<section className="cat">
    <h1>Now for you profile picture...</h1>
    <p>Upload your picture</p>
    <section className="upload">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {url && <img src={url} alt="Profile" width={100} />}
    </section>

    <h2>or </h2>

    <p> choose one</p>
    <section className="pics">
    {avatars.map((a)=>(
        <img id={a} src={a} alt="image" onClick={avatar_click}/>

        

    ))}
    </section>

</section>);

    
}