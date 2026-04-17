const mongoose = require("mongoose");

const UsuarioEsquema = new mongoose.Schema({
    nombre:{
        type: String,
        required: true      
    },
    email:{
        type: String,
        required: true,
    },
    genero:{
        type: String,
        required: true,
    },
    plataformas:{
        type: [String],
    }
});

module.exports = mongoose.model("Usuario", UsuarioEsquema);