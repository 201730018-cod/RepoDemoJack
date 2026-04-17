import { useEffect } from "react";
import { useState } from "react";

export function DemoEffect(){
    const [hora, setHora] = useState(new Date());

    useEffect(
        ()=>{
            const timer = setInterval(()=>{
                setHora(new Date())
            }, 1000);
            return () => clearInterval(timer)
        },[]
    );

    return <h1>{hora.toLocaleTimeString()}</h1>
}