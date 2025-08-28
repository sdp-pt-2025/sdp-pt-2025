import { doc, getDoc } from "firebase/firestore";
import { useState,useEffect } from "react";
import { db } from "../firebase/firebase";
import "../css/profile.css"


export default function Profile(){
   // let email= localStorage.getItem("email");
   let email= "2715751@students.wits.ac.za";
    const[info,setinfo]=useState([]);
    const[image,setimage]=useState("");
//let username=localStorage.getItem("username");
let username ="Hlulani Baloyi";




    //fetch the details
    const fetch_userinfo=async()=>{
        let arr=[];
        try{
           let capture= await getDoc(doc(db,"Users",email));
            if(capture.exists()){
                arr.push(capture);
            }
            setinfo(arr);

            let it = await getDoc(doc(db,"Users",email,"Profile_Picture","main"));
            if(it.exists()){
               setimage(it.data().image);
            }

        }catch(error){
            console.log(error);
        }



    };

useEffect(() => {
    fetch_userinfo();
}, []);

   return(
    <section>
       
            <section className="one">
        <section className="shot">
            <img src={image} alt="image"/>
        </section>
        
            {info.map((doc)=>(
                <section className="hi" key={"hi"}>

                <h2>{doc.data().Username}, {doc.data().Age}</h2>
                 <h1>{doc.data().DOS}</h1>
                  <h1>Year of study:{doc.data().YOS}</h1>
                  <h1>"{doc.data().Bio}"</h1>
                  <section className="buttons">
                  <button> Edit Profile</button>
                  <button className="lo"> Settings</button>
                  </section>
                  </section>
            ))}
        </section>
         <section className="two">
            <button className="child">
+ Create a study group
            </button>
            <button className="child"> </button>
        </section>
    </section>
   );
}