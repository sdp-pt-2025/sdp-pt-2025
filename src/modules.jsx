import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function Modules(){
   let std_num=localStorage.getItem("student_number");
    let navigate=useNavigate();
    const[module,setmodule]=useState("");
    const[modules,setmodules]=useState([]);

    const handlesubmit=async(e)=>{
        e.preventDefault();
        //take in the module adddoc it
        await fetch(`https://sdp-pt-2025.onrender.com/modules?s=${std_num}&m=${module}`)
       .then(res=>res.json)
       .catch(e=>console.log(e));


    };

    

    
        const display=async()=>{
            const arr=[];
            try{
            const res=await fetch(`https://sdp-pt-2025.onrender.com/getmodules?s=${std_num}`)
            const data= res.map(data=>data.module);
            setmodules(data);
            
            
            }catch(error){
            console.log(error);


            }

        };
useEffect(()=>{
        display();
    },[module]);

const remove=async(e)=>{
        const Remove=e.target.id;

        await fetch(`https://sdp-pt-2025.onrender.com/deletemodule?s=${std_num}&m=${Remove}`,[std_num,Remove],{Method:DELETE}).then(res=>res.json())
        .catch(e=>console.log(e));
      

    };
    const next=async()=>{
        navigate("/profilepicture");
        


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