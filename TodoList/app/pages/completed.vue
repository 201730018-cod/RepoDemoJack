<template>
  <div class="container">
    <h1>✅ Tareas Completadas</h1>

    <ul>
      <li v-for="task in completed" :key="task.id" class="task-item">
        <span class="done">{{ task.title }}</span>
        <span v-if="task.favorite" class="badge">⭐ Favorita</span>
      </li>
    </ul>

    <p v-if="completed.length === 0">No hay tareas completadas aún.</p>

    <div class="nav">
      <NuxtLink to="/">🏠 Inicio</NuxtLink>
      <NuxtLink to="/favorites">⭐ Favoritas</NuxtLink>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      completed: []
    }
  },
  async mounted() {
    const tasks = await $fetch('/api/tasks')
    this.completed = tasks.filter(t => t.completed)
  }
}
</script>

<style>
.container { max-width: 600px; margin: 40px auto; font-family: sans-serif; padding: 0 20px; }
.task-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #ddd; }
.done { text-decoration: line-through; color: gray; }
.badge { background: #ff9800; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px; }
.nav { margin-top: 30px; display: flex; gap: 20px; }
</style>