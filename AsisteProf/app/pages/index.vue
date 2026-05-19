<template>
  <div>
    <h2 style="margin-bottom: 20px;">📊 Dashboard</h2>

    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-number">{{ grupos.length }}</div>
        <div class="stat-label">Grupos registrados</div>
      </div>
      <div class="card stat-card">
        <div class="stat-number">{{ totalEstudiantes }}</div>
        <div class="stat-label">Estudiantes en total</div>
      </div>
      <div class="card stat-card">
        <div class="stat-number">{{ totalClases }}</div>
        <div class="stat-label">Clases registradas</div>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom: 16px;">📋 Resumen por grupo</h3>
      <table v-if="grupos.length > 0">
        <thead>
          <tr>
            <th>Grupo</th>
            <th>Materia</th>
            <th>Estudiantes</th>
            <th>Clases</th>
            <th>Asistencia promedio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in resumen" :key="g.id">
            <td>{{ g.nombre }}</td>
            <td>{{ g.materia }}</td>
            <td>{{ g.estudiantes }}</td>
            <td>{{ g.clases }}</td>
            <td>
              <span :class="badgeClass(g.promedio)">{{ g.promedio }}%</span>
            </td>
            <td>
              <NuxtLink :to="'/asistencia/' + g.id" class="btn btn-primary" style="text-decoration:none; font-size:13px;">
                Pase de lista
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>No hay grupos registrados aún. <NuxtLink to="/grupos">Crear grupo</NuxtLink></p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      grupos: [],
      resumen: [],
      totalEstudiantes: 0,
      totalClases: 0
    }
  },
  async mounted() {
    await this.loadDashboard()
  },
  methods: {
    async loadDashboard() {
      this.grupos = await $fetch('/api/grupos')
      let estudiantes = 0
      let clases = 0
      const resumen = []

      for (const g of this.grupos) {
        const ests = await $fetch('/api/estudiantes?grupo_id=' + g.id)
        const fechas = await $fetch('/api/asistencia?grupo_id=' + g.id)
        const stats = await $fetch('/api/asistencia?stats=1&grupo_id=' + g.id)

        estudiantes += ests.length
        clases += fechas.length

        const promedio = stats.length > 0
          ? Math.round(stats.reduce((acc, s) => acc + s.porcentaje, 0) / stats.length)
          : 0

        resumen.push({
          ...g,
          estudiantes: ests.length,
          clases: fechas.length,
          promedio
        })
      }

      this.resumen = resumen
      this.totalEstudiantes = estudiantes
      this.totalClases = clases
    },
    badgeClass(porcentaje) {
      if (porcentaje >= 80) return 'badge badge-green'
      if (porcentaje >= 60) return 'badge badge-yellow'
      return 'badge badge-red'
    }
  }
}
</script>

<style>
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
.stat-card { text-align: center; }
.stat-number { font-size: 42px; font-weight: bold; color: #2c3e50; }
.stat-label { color: #888; margin-top: 4px; }
.badge { padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: bold; }
.badge-green { background: #d4edda; color: #155724; }
.badge-yellow { background: #fff3cd; color: #856404; }
.badge-red { background: #f8d7da; color: #721c24; }
</style>