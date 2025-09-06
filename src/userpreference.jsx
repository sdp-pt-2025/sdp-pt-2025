import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function UserPreferance(){
    let navigate=useNavigate();
    let stdnum=localStorage.getItem("student_number");
    const [goal, set_goal]=useState("");
    const [bio,set_bio]=useState("");
    const [style, setStyle]=useState("");
    const [motivator, setmotivator]=usetate("");
    const [location, setlocation]=useState("");


    const submit=async ()=>{
        await fetch(`https://sdp-pt-2025.onrender.com/userprerence?s=${stdnum}&sg=${goal}&m=${motivator}$sl=${location}&b=${bio}&l=${style}`,{method:POST})
        .then(res=>res.json())
        .catch(error=> console.log(error));
        navigate("modules");

    };


    return(
    <section>
        <h1>Tell us a bit about yourself</h1>
        <form onSubmit={submit}>
            <label>Bio:</label>
                        <input value={bio} onChange={e=>set_bio(e.target.value)} required/>

            <label>What is your learning style? </label>
            <input value={style} onChange={e=>setStyle} required/>
            <label>What motivates you to study?</label>
                        <input value={motivator} onChange={e=>setmotivator(e.target.value)} required/>

            <label>Where do you usually study?</label>
                        <input value={location} onChange={e=>setlocation(e.target.value)} required/>

            <label>What is your study goal?</label>
                        <input value={location} onChange={e=>set_goal(e.target.value)} required/>

        </form>
    </section>
    );








}