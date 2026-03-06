const express = require('express');
const app = express();
const port = 3600; //el puerto puede ser cualquier número entre 1024 y 65535

app.use(express.json());

let pokemones = [
    {id:1, name:"Charizard", type:"Fire"},
    {id:2, name:"Blastoise", type:"Water"},
    {id:3, name:"Pikachu", type:"Electric"}
];


//route root
app.get('/', (req, res) => {
  return res.send('¡Hola, mundo!');
});

//route pokemon
app.get('/pokemon', (req, res) => {
  return res.json(pokemones);
});

app.get("/pokemon/3",(req, res)=>{
    return res.json(pokemones[2]);
});

app.post("/alta-pokemon",(req, res)=>{
    let nuevo_pokemon = {
        id: pokemones.length + 1,
        name: req.body.name,
        type: req.body.type
    };
    pokemones.push(nuevo_pokemon);
    return res.status(200).json(pokemones);
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});