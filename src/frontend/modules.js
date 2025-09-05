import { setDoc,doc, getDocs,query,collection, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function Modules(){
    let username = localStorage.getItem("username");
    let email=localStorage.getItem("email");
    let navigate=useNavigate();
    const[module,setmodule]=useState("");
    const[modules,setmodules]=useState([]);

    const handlesubmit=async(e)=>{
        e.preventDefault();
        //take in the module adddoc it
        try{
            await setDoc(doc(db,"Users",email,"Modules",module),{});
            setmodule("");

        }catch(error){
            console.log(error);

        }


    };

    

    
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

const remove=async(e)=>{
        const Remove=e.target.id;
        try{
        await deleteDoc(doc(db,"Users",email,"Modules",Remove));}
        catch(error){
            console.log(error);
        }
        
        display();
      

    };
    const next=async()=>{
        navigate("/avatar");
        


    };

    if(modules.length==0){
        return(
            <section>
               <h1>Which modules are you currently enrolled in?</h1>
                <form onSubmit={handlesubmit}>
            <input value={module} onChange={(e)=> setmodule(e.target.value)} required type="text"/>
            <button>Add</button>
        </form>
                </section>
                

        );
    }

    return(<section>
        <h1>Which modules are you currently enrolled in?</h1>
        <section className="display">
            {modules.map((docs)=>(
                <section key={docs}>
                    <h2>{docs}</h2>
                    <button id={docs} onClick={remove}>Remove</button>
                </section>

            ))}
        </section>
        <form onSubmit={handlesubmit}>
            <input value={module} onChange={(e)=> setmodule(e.target.value)} required type="text"/>
            <button>Add</button>
        </form>
        <section className="Button">
            <button onClick={next}>Proceed</button>
        </section>
    
    
    </section>);
}