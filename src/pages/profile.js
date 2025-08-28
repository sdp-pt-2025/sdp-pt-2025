import { doc, getDoc ,getDocs,collection} from "firebase/firestore";
import { useState,useEffect } from "react";
import { db } from "../firebase/firebase";
import "../css/profile.css"


export default function Profile(){
   // let email= localStorage.getItem("email");
   let email= "2715751@students.wits.ac.za";
    const[info,setinfo]=useState([]);
    const[image,setimage]=useState("");

        const[modules,setmodules]=useState([]);

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

const display=async()=>{
            const arr=[]
            //getdocs
            const capture= await getDocs(collection(db,"Users",email,"Modules"));
            capture.forEach((doc)=>{
                arr.push(doc.id);
            })
            setmodules(arr);


        };
useEffect(()=>{
        display();
    },[module]);

   return(
    <section className="profile">
    
       <header><h2>StudyBuddy</h2>
       </header>
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
    
        <section className="divider"></section>
        <section className="modules">
            <section className="title"><p>Modules</p></section>
             <section className="display">
            {modules.map((docs)=>(
                <section key={docs}>
                    <h2>{docs}</h2>
                    
                </section>

            ))}
        </section>
        </section>
        <section className="divider"></section>
        <section className="Study_groups">
                        <section className="title">Study groups</section>

            
        </section>
        <section className="divider"></section>
        <section className="Upcoming_events">
                        <section className="title"><p>Upcoming events</p></section>

        </section>
   </section>
   );
}
