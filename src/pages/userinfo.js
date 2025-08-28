import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc,setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import "../css/userinfo.css"

export default function UserInfo() {
  const navigate = useNavigate();

  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");
console.log(email,username);
  const [Age, setAge] = useState("");
  const [YOS, setYOS] = useState("");
  const [DOS, setDOS] = useState("");
  const [Bio, setBio] = useState("");
  const [phone_number, setphone_number] = useState("");

  
  const [image, setImage] = useState(null);
/** 
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result); 
      reader.readAsDataURL(file);
    }
  };
**/
  const handlesubmit = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "Users", email), {
        Username: username,
        Bio: Bio,
        Email: email,
        Age: Age,
        YOS: YOS,
        DOS: DOS,
        Phone_number: phone_number
       // Image: image, 
      });

      navigate("/modules");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className="hello">
      <h1>Hey {username}, let's set up your profile.</h1>
      <form onSubmit={handlesubmit} className="Form">
        <section className="field">
        <label>Age:</label>
        <input type="number" required value={Age} onChange={(e) => setAge(e.target.value)} />
        </section>
        <section className="field">
        <label>Year of Study:</label>
        <input type="number" required value={YOS} onChange={(e) => setYOS(e.target.value)} />
        </section>
        <section className="field">
        <label>Degree of study:</label>
        <input value={DOS} required onChange={(e) => setDOS(e.target.value)} />
        </section>
        <section className="field">
        <label>Phone number:</label>
        <input type="number" required value={phone_number} onChange={(e) => setphone_number(e.target.value)} />
        </section>
        <section className="field">
        <label>Bio:</label>
        <textarea value={Bio} required onChange={(e) => setBio(e.target.value)} />
          </section>
        

       
    {/*    <label>Upload Profile Image:</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {image && <img src={image} alt="Preview" style={{ width: "150px", marginTop: "10px" }} />}
*/}
        <button>Continue</button>
      </form>
    </section>
  );
}
