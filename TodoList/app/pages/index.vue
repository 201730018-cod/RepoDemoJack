<template>
  <div class="container">
    <h1>📝 Todo List</h1>

    <div class="input-area">
      <input v-model="newTask" placeholder="Nueva tarea..." />
      <button @click="addTask">Agregar</button>
    </div>

    <ul>
      <li v-for="task in tasks" :key="task.id" class="task-item">
        <span :class="{ done: task.completed }">{{ task.title }}</span>

        <div class="actions">
          <button @click="toggleFavorite(task)">{{ task.favorite ? '⭐' : '☆' }}</button>
          <button @click="toggleCompleted(task)">{{ task.completed ? '↩️' : '✅' }}</button>
          <button @click="startEdit(task)">✏️</button>
          <button @click="deleteTask(task.id)">🗑️</button>
        </div>
      </li>
    </ul>

    <div v-if="editing" class="edit-area">
      <input v-model="editTitle" />
      <button @click="saveEdit">Guardar</button>
      <button @click="editing = null">Cancelar</button>
    </div>

    <div class="nav">
      <NuxtLink to="/favorites">⭐ Favoritas</NuxtLink>
      <NuxtLink to="/completed">✅ Completadas</NuxtLink>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tasks: [],
      newTask: '',
      editing: null,
      editTitle: ''
    }
  },
  async mounted() {
    await this.loadTasks()
  },
  methods: {
    async loadTasks() {
      this.tasks = await $fetch('/api/tasks')
    },
    async addTask() {
      if (!this.newTask.trim()) return
      await $fetch('/api/tasks', {
        method: 'POST',
        body: { title: this.newTask }
      })
      this.newTask = ''
      await this.loadTasks()
    },
    async deleteTask(id) {
      await $fetch('/api/tasks', {
        method: 'DELETE',
        body: { id }
      })
      await this.loadTasks()
    },
    async toggleFavorite(task) {
      await $fetch('/api/tasks', {
        method: 'PUT',
        body: { id: task.id, favorite: !task.favorite }
      })
      await this.loadTasks()
    },
    async toggleCompleted(task) {
      await $fetch('/api/tasks', {
        method: 'PUT',
        body: { id: task.id, completed: !task.completed }
      })
      await this.loadTasks()
    },
    startEdit(task) {
      this.editing = task.id
      this.editTitle = task.title
    },
    async saveEdit() {
      await $fetch('/api/tasks', {
        method: 'PUT',
        body: { id: this.editing, title: this.editTitle }
      })
      this.editing = null
      await this.loadTasks()
    }
  }
}
</script>

<style>
.container { max-width: 600px; margin: 40px auto; font-family: sans-serif; padding: 0 20px; }
.input-area { display: flex; gap: 10px; margin-bottom: 20px; }
.input-area input { flex: 1; padding: 8px; font-size: 16px; }
.task-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #ddd; }
.actions { display: flex; gap: 6px; }
.done { text-decoration: line-through; color: gray; }
.edit-area { display: flex; gap: 10px; margin-top: 20px; }
.edit-area input { flex: 1; padding: 8px; }
.nav { margin-top: 30px; display: flex; gap: 20px; }
button { cursor: pointer; padding: 6px 10px; }
</style>