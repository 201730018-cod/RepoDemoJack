<template>
  <div>
    <h2 style="margin-bottom: 20px;">👥 Grupos</h2>

    <div class="card">
      <h3 style="margin-bottom: 16px;">Crear nuevo grupo</h3>
      <div class="form-row">
        <input v-model="nuevoGrupo.nombre" placeholder="Nombre del grupo (ej. 9A)" />
        <input v-model="nuevoGrupo.materia" placeholder="Materia (ej. Matemáticas)" />
        <button class="btn btn-primary" @click="crearGrupo">Crear grupo</button>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom: 16px;">Grupos registrados</h3>
      <table v-if="grupos.length > 0">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Materia</th>
            <th>Fecha creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in grupos" :key="g.id">
            <td>{{ g.nombre }}</td>
            <td>{{ g.materia }}</td>
            <td>{{ formatDate(g.created_at) }}</td>
            <td style="display: flex; gap: 8px;">
              <NuxtLink :to="'/grupos/' + g.id" class="btn btn-primary" style="text-decoration:none; font-size:13px;">
                Ver alumnos
              </NuxtLink>
              <NuxtLink :to="'/asistencia/' + g.id" class="btn btn-success" style="text-decoration:none; font-size:13px;">
                Pase de lista
              </NuxtLink>
              <button class="btn btn-danger" @click="eliminarGrupo(g.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>No hay grupos registrados aún.</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      grupos: [],
      nuevoGrupo: { nombre: '', materia: '' }
    }
  },
  async mounted() {
    await this.loadGrupos()
  },
  methods: {
    async loadGrupos() {
      this.grupos = await $fetch('/api/grupos')
    },
    async crearGrupo() {
      if (!this.nuevoGrupo.nombre.trim() || !this.nuevoGrupo.materia.trim()) return
      await $fetch('/api/grupos', {
        method: 'POST',
        body: this.nuevoGrupo
      })
      this.nuevoGrupo = { nombre: '', materia: '' }
      await this.loadGrupos()
    },
    async eliminarGrupo(id) {
      if (!confirm('¿Eliminar este grupo y todos sus datos?')) return
      await $fetch('/api/grupos', {
        method: 'DELETE',
        body: { id }
      })
      await this.loadGrupos()
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('es-MX')
    }
  }
}
</script>

<style>
.form-row { display: flex; gap: 10px; align-items: center; }
.form-row input { flex: 1; }
</style>