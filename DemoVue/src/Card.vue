<template>
  <div>
    <h2>Pokémon</h2>
    <div v-if="pokemon">
      <h3>{{ pokemon.name }}</h3>
      <img :src="pokemon.sprites.front_default" :alt="pokemon.name" />
      <p>Altura: {{ pokemon.height }}</p>
      <p>Peso: {{ pokemon.weight }}</p>
    </div>
    <p v-else>Cargando...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const pokemon = ref(null)

onMounted(async () => {
  const respuesta = await fetch('https://pokeapi.co/api/v2/pokemon/pikachu')
  const datos = await respuesta.json()
  pokemon.value = datos
})
</script>