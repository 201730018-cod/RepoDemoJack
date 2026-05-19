<template>
  <div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <h2>👥 {{ grupo?.nombre }} — {{ grupo?.materia }}</h2>
      <div style="display:flex; gap:10px;">
        <NuxtLink to="/grupos" class="btn btn-secondary" style="text-decoration:none;">← Regresar</NuxtLink>
        <NuxtLink :to="'/asistencia/' + id" class="btn btn-success" style="text-decoration:none;">📋 Pase de lista</NuxtLink>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:16px;">Agregar estudiante</h3>
      <div class="form-row">
        <input v-model="nuevoEst.nombre" placeholder="Nombre completo" />
        <input v-model="nuevoEst.matricula" placeholder="Matrícula" />
        <button class="btn btn-primary" @click="agregarEstudiante">Agregar</button>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:16px;">Estudiantes ({{ estudiantes.length }})</h3>
      <table v-if="estudiantes.length > 0">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Matrícula</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(est, index) in estudiantes" :key="est.id">
            <td>{{ index + 1 }}</td>
            <td>{{ est.nombre }}</td>
            <td>{{ est.matricula }}</td>
            <td>
              <button class="btn btn-danger" @click="eliminarEstudiante(est.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>No hay estudiantes en este grupo aún.</p>
    </div>

    <div class="card" v-if="stats.length > 0">
      <h3 style="margin-bottom:16px;">📊 Estadísticas de asistencia</h3>
      <table>
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Matrícula</th>
            <th>Clases</th>
            <th>Asistencias</th>
            <th>Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in stats" :key="s.matricula">
            <td>{{ s.estudiante }}</td>
            <td>{{ s.matricula }}</td>
            <td>{{ s.total_clases }}</td>
            <td>{{ s.asistencias }}</td>
            <td>
              <span :class="badgeClass(s.porcentaje)">{{ s.porcentaje }}%</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id: null,
      grupo: null,
      estudiantes: [],
      stats: [],
      nuevoEst: { nombre: '', matricula: '' }
    }
  },
  async mounted() {
    this.id = this.$route.params.id
    await this.loadData()
  },
  methods: {
    async loadData() {
      const grupos = await $fetch('/api/grupos')
      this.grupo = grupos.find(g => g.id == this.id)
      this.estudiantes = await $fetch('/api/estudiantes?grupo_id=' + this.id)
      this.stats = await $fetch('/api/asistencia?stats=1&grupo_id=' + this.id)
    },
    async agregarEstudiante() {
      if (!this.nuevoEst.nombre.trim() || !this.nuevoEst.matricula.trim()) return
      await $fetch('/api/estudiantes', {
        method: 'POST',
        body: { ...this.nuevoEst, grupo_id: parseInt(this.id) }
      })
      this.nuevoEst = { nombre: '', matricula: '' }
      await this.loadData()
    },
    async eliminarEstudiante(id) {
      if (!confirm('¿Eliminar este estudiante?')) return
      await $fetch('/api/estudiantes', {
        method: 'DELETE',
        body: { id }
      })
      await this.loadData()
    },
    badgeClass(porcentaje) {
      if (porcentaje >= 80) return 'badge badge-green'
      if (porcentaje >= 60) return 'badge badge-yellow'
      return 'badge badge-red'
    }
  }
}
</script>