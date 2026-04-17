import { useState } from "react";

export default function Demo(){
    const [nombre, setNombre]=useState("Luis");
    return(
        <div>
            <h2>{nombre}</h2>
            <button onClick={()=>{
                /*if (nombre==="Luis"){
                    setNombre("Arturo");
                }
                else{
                    setNombre("Luis");
                }*/
               nombre==="Luis" ? setNombre("Arturo") : setNombre("Luis");
            }}>
                Click me
            </button>
        </div>
    );
}

