import { useNavigate } from "react-router-dom";


export default function Dashboard(){
    let navigate=useNavigate();

    const profile=()=>{
        navigate("/profile");
    };

    
        let username=localStorage.getItem("username");
        return(
        <section>
            Welcome, {username}

            <button onClick={profile}>Profile</button>

        </section>
    );

}