//async, await, promises, fetch este ultimo para consumir apis

// const showMessage = () => {
//     setTimeout(()=>{
//         console.log("Hello");
//     },3000)
    
// }

// showMessage();
// console.log("Nuevo mensaje");

// async function tarea(){
//     return "asynchronous task";
// }

// async function ejecuta(){
//     const respuesta = await tarea();
//     console.log(respuesta);
// }

// ejecuta();

//promises -> tres estados: pending, fullfilled, rejected

// const promesa = new Promise(
    
//     (resolve,reject)=>{
//         const todobien = false;
//         setTimeout(()=>{
//             if(todobien){
//             resolve("Todo está muy bien!");
//         }else{
//             reject("Todo mal");
//         }
//         },5000)
        
//     }
// );
// promesa.then(
//     (respuesta)=>{console.log(respuesta)}
// ).catch(
//     (error)=>{console.log(error)}
// );

// const promesaUno = new Promise(
//     (resolve,reject) => {
//         resolve("Promesa uno resuelta");
//     }
// );

// const promesaDos = new Promise(
//     (resolve,reject) => {
//         resolve("Promesa dos resuelta");
//     }
// );

// const promesaTres = new Promise(
//     (resolve,reject) => {
//         reject("Promesa tres fallida");
//     }
// );

// promesaUno
// .then(
//     (res) => {
//         console.log(res);
//         return promesaDos;
//     }
// )
// .then(
//     (res) => {
//         console.log(res);
//         return promesaTres;
//     }
// )
// .catch(
//     (e) => {
//         console.log(e);
        
//     }
// );

// otra forma
// const promesaUno = new Promise(
//     (resolve,reject) => {
//         resolve("Promesa uno resuelta");
//     }
// );

// const promesaDos = new Promise(
//     (resolve,reject) => {
//         resolve("Promesa dos resuelta");
//     }
// );

// const promesaTres = new Promise(
//     (resolve,reject) => {
//         reject("Promesa tres fallida");
//     }
// );

// promesaUno.then(
//     (respuesta) => {
//         console.log(respuesta);
//         promesaDos.then(
//             (respuesta2) => {
//                 console.log(respuesta2);
//                 promesaTres.then(
//                     (respuesta3) => {console.log(respuesta3)}
//                 ).catch(
//                     (error) => {console.log(error)}
//                 )
//             }
//         )
//     }
// )

async function fetchPokemon(){
    try{
        const respuesta = await fetch('https://pokeapi.co/api/v2/pokemon?limit=12');
        const datos = await respuesta.json();
        datos.results.forEach(
            pokemon => {fetchDetalles(pokemon.url)} 
        )

    
    }catch(error){
        console.log("Error para obtener los pokemones")
    }

    async  function fetchDetalles(url){
        try{
        const detalles = await fetch(datos.results[0].url);
        const pokemon = await detalles.json();
        createCard(pokemon);
        }catch(error){
            console.log("No se pudo obtener la info del pokemon");
        }
    }
   
    
function createCard(pokemon){
        //hacer la tarjeta
    const col = document.createElement("div");
    col.className="col-md-4 col-lg-3";
    col.innerHTML = `
    <div class="card h-100 shadow-lg bg-secondary text-white">
        <img src="${pokemon.sprites.other['official-artwork'].front_default}"
        class="card-img-top p-3"
        alt ="${pokemon.name}">
        <div class="card-body text-center">
            <h5 class="card-title text-capitalize">${pokemon.name}</h5>
            <p class="card-text">
                Tipo: ${pokemon.types.map(t => t.type.name).join(", ")}
            </p>
        </div>
    </div>
    `;
    
    contenedor.appendChild(col);
}



fetchPokemon();