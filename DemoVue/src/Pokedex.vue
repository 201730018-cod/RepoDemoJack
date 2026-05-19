<template>
  <div>
    <h2>Pokédex</h2>
    <div style="display: flex; flex-wrap: wrap; gap: 16px;">
      <div
        v-for="pokemon in pokemones"
        :key="pokemon.name"
        style="border: 1px solid #ccc; padding: 12px; text-align: center; width: 150px;"
      >
        <h3>{{ pokemon.name }}</h3>
        <img :src="pokemon.sprite" :alt="pokemon.name" />
      </div>
    </div>
    <p v-if="pokemones.length === 0">Cargando pokémones...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const pokemones = ref([])

onMounted(async () => {
  const respuesta = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20')
  const datos = await respuesta.json()

  const promesas = datos.results.map(async (p) => {
    const detalle = await fetch(p.url)
    const info = await detalle.json()
    return {
      name: info.name,
      sprite: info.sprites.front_default
    }
  })

  pokemones.value = await Promise.all(promesas)
})
</script>