import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserInfo(){
    let navigate=useNavigate();
    const [std_num,setstd_num]=useState("");
    const [age,setage]=useState("");
   let username=localStorage.getItem("username");
   let email=localStorage.getItem("email");
    const[DOS,setDOS]=useState("");
    const[YOS,setYOS]=useState("");

    const submit=async(e)=>{
        e.preventDefault();
        await fetch(`https://sdp-pt-2025.onrender.com/userinfo?a=${age}&s=${std_num}&d=${DOS}&y=${YOS}&e=${email}&u=${username}`,{ method: "POST" })
        .then(res=>res.json())
        .catch(e=>console.log(error));
        navigate("/userpreference");

    };


    return(
        <section>
            <h1>Let's get you started...</h1>
            <form onSubmit={submit}>
               

                <label>Student number:</label>
                <input value={std_num} onChange={e=>setstd_num(e.target.value)}/>

                <label>Age:</label>
                                <input value={age} onChange={e=>setage(e.target.value)}/>


                <label>Year of study:</label>
                                <input value={YOS} onChange={e=>setYOS(e.target.value)}/>


                <label>Degree of study:</label>
                                <input value={DOS} onChange={e=>setDOS(e.target.value)}/>

        <button>Continue</button>
            </form>

        </section>
    );

}