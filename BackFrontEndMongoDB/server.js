const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const Usuario = require("./models/Usuario");

const app = express();
const port = 3600;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Conexión a MongoDB

mongoose.connect("mongodb://jackasii:ventiladO1@ac-yktfvsa-shard-00-00.rrzfdeq.mongodb.net:27017,ac-yktfvsa-shard-00-01.rrzfdeq.mongodb.net:27017,ac-yktfvsa-shard-00-02.rrzfdeq.mongodb.net:27017/GrupoB?ssl=true&replicaSet=atlas-8iwyhf-shard-0&authSource=admin&appName=Jack1")
.then(
    () => console.log("Conexión a MongoDB exitosa")
)
.catch(
    err => console.log(err)
);

app.get("/api/usuarios", async(req, res) => {
    const usuarios = await Usuario.find();
    res.json(usuarios);
});

app.post("/api/usuarios", async(req, res) => {
    const nuevo = new Usuario(
        {
            nombre: req.body.nombre,
            email: req.body.email,
            genero: req.body.genero,
            plataformas: req.body.plataformas
        }
    );
    const guardado = await nuevo.save();
    res.json(guardado);
});

app.put("/api/usuarios/:id", async(req, res) => {
    console.log("ID recibido:", req.params.id); // ← agrega esto

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
        req.params.id,
        {
         nombre: req.body.nombre,
         email: req.body.email,
         genero: req.body.genero,
         plataformas: req.body.plataformas   
        },
        {new: true}
    );


    res.json(usuarioActualizado);
});

app.listen(port, () => {
    console.log("Listening at http://localhost:3600");
});