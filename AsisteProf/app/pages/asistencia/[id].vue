<template>
  <div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <h2>📋 Pase de lista — {{ grupo?.nombre }}</h2>
      <div style="display:flex; gap:10px;">
        <NuxtLink :to="'/grupos/' + id" class="btn btn-secondary" style="text-decoration:none;">← Regresar</NuxtLink>
      </div>
    </div>

    <div class="card">
      <div class="form-row" style="align-items:center;">
        <div>
          <label style="font-weight:600; margin-bottom:6px; display:block;">📅 Fecha de clase</label>
          <input type="date" v-model="fecha" style="width:auto;" />
        </div>
        <button class="btn btn-primary" style="margin-top:22px;" @click="guardarAsistencia">
          💾 Guardar asistencia
        </button>
      </div>
    </div>

    <div class="card" v-if="estudiantes.length > 0">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h3>Estudiantes ({{ presentes }}/{{ estudiantes.length }} presentes)</h3>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-success" @click="marcarTodos(true)">✅ Todos presentes</button>
          <button class="btn btn-danger" @click="marcarTodos(false)">❌ Todos ausentes</button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Matrícula</th>
            <th style="text-align:center;">Asistencia</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(est, index) in estudiantes" :key="est.id" :class="{ 'row-present': asistencias[est.id], 'row-absent': !asistencias[est.id] }">
            <td>{{ index + 1 }}</td>
            <td>{{ est.nombre }}</td>
            <td>{{ est.matricula }}</td>
            <td style="text-align:center;">
              <button
                class="btn-asistencia"
                :class="asistencias[est.id] ? 'presente' : 'ausente'"
                @click="toggleAsistencia(est.id)"
              >
                {{ asistencias[est.id] ? '✅ Presente' : '❌ Ausente' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card" v-if="fechasAnteriores.length > 0">
      <h3 style="margin-bottom:16px;">📅 Clases anteriores</h3>
      <div class="fechas-grid">
        <button
          v-for="f in fechasAnteriores"
          :key="f.fecha"
          class="btn btn-secondary fecha-btn"
          @click="cargarFecha(f.fecha)"
        >
          {{ formatDate(f.fecha) }}
        </button>
      </div>
    </div>

    <div v-if="guardado" class="toast">✅ Asistencia guardada correctamente</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id: null,
      grupo: null,
      estudiantes: [],
      asistencias: {},
      fecha: new Date().toISOString().split('T')[0],
      fechasAnteriores: [],
      guardado: false
    }
  },
  computed: {
    presentes() {
      return Object.values(this.asistencias).filter(v => v).length
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
      this.fechasAnteriores = await $fetch('/api/asistencia?grupo_id=' + this.id)
      await this.cargarFecha(this.fecha)
    },
    async cargarFecha(fecha) {
      this.fecha = fecha
      const registros = await $fetch(`/api/asistencia?grupo_id=${this.id}&fecha=${fecha}`)
      const map = {}
      for (const est of this.estudiantes) {
        map[est.id] = false
      }
      for (const r of registros) {
        map[r.estudiante_id] = r.presente === 1
      }
      this.asistencias = map
    },
    toggleAsistencia(estudianteId) {
      this.asistencias[estudianteId] = !this.asistencias[estudianteId]
    },
    marcarTodos(valor) {
      const map = {}
      for (const est of this.estudiantes) {
        map[est.id] = valor
      }
      this.asistencias = map
    },
    async guardarAsistencia() {
      const registros = this.estudiantes.map(est => ({
        estudiante_id: est.id,
        grupo_id: parseInt(this.id),
        fecha: this.fecha,
        presente: this.asistencias[est.id] ? 1 : 0
      }))
      await $fetch('/api/asistencia', {
        method: 'POST',
        body: { registros }
      })
      this.fechasAnteriores = await $fetch('/api/asistencia?grupo_id=' + this.id)
      this.guardado = true
      setTimeout(() => { this.guardado = false }, 3000)
    },
    formatDate(fecha) {
      return new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
      })
    }
  }
}
</script>

<style>
.row-present { background: #f0fff4; }
.row-absent { background: #fff5f5; }
.btn-asistencia {
  padding: 6px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}
.presente { background: #d4edda; color: #155724; }
.ausente { background: #f8d7da; color: #721c24; }
.fechas-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.fecha-btn { font-size: 13px; }
.toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: #27ae60;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
</style>