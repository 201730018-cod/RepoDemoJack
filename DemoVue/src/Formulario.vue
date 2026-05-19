<template>
  <div>
    <h2>Formulario</h2>
    <input v-model="nombre" placeholder="Escribe tu nombre" />
    <input v-model="correo" placeholder="Escribe tu correo" />

    <h3>Datos ingresados:</h3>
    <p>Nombre: {{ nombre }}</p>
    <p>Correo: {{ correo }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const nombre = ref('')
const correo = ref('')
</script>