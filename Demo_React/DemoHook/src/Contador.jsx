import { useState } from "react";

export default function contador(){
    const [contador, setContador]=useState(0);
    
    return(
        <div>
            <h2>{contador}</h2>
            <button onClick={()=>setContador(contador+1)}>Incrementar</button>
            <button onClick={()=>setContador(contador-1)}>Decrementar</button>
            <button onClick={()=>setContador(0)}>Reiniciar</button>
        </div>
    );
}