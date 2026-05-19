<template>
  <div class="container">
    <h1>⭐ Tareas Favoritas</h1>

    <ul>
      <li v-for="task in favorites" :key="task.id" class="task-item">
        <span :class="{ done: task.completed }">{{ task.title }}</span>
        <span v-if="task.completed" class="badge">Completada</span>
      </li>
    </ul>

    <p v-if="favorites.length === 0">No hay tareas favoritas aún.</p>

    <div class="nav">
      <NuxtLink to="/">🏠 Inicio</NuxtLink>
      <NuxtLink to="/completed">✅ Completadas</NuxtLink>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      favorites: []
    }
  },
  async mounted() {
    const tasks = await $fetch('/api/tasks')
    this.favorites = tasks.filter(t => t.favorite)
  }
}
</script>

<style>
.container { max-width: 600px; margin: 40px auto; font-family: sans-serif; padding: 0 20px; }
.task-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #ddd; }
.done { text-decoration: line-through; color: gray; }
.badge { background: #4caf50; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px; }
.nav { margin-top: 30px; display: flex; gap: 20px; }
</style>