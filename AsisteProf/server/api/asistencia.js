import db from './db.js'

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    const query = getQuery(event)

    if (query.stats && query.grupo_id) {
      const estudiantes = db.prepare('SELECT * FROM estudiantes WHERE grupo_id = ?').all(query.grupo_id)
      const stats = estudiantes.map(est => {
        const total = db.prepare('SELECT COUNT(*) as total FROM asistencia WHERE estudiante_id = ? AND grupo_id = ?').get(est.id, query.grupo_id)
        const presentes = db.prepare('SELECT COUNT(*) as total FROM asistencia WHERE estudiante_id = ? AND grupo_id = ? AND presente = 1').get(est.id, query.grupo_id)
        return {
          estudiante: est.nombre,
          matricula: est.matricula,
          total_clases: total.total,
          asistencias: presentes.total,
          porcentaje: total.total > 0 ? Math.round((presentes.total / total.total) * 100) : 0
        }
      })
      return stats
    }

    if (query.grupo_id && query.fecha) {
      const registros = db.prepare(`
        SELECT a.*, e.nombre, e.matricula 
        FROM asistencia a 
        JOIN estudiantes e ON a.estudiante_id = e.id 
        WHERE a.grupo_id = ? AND a.fecha = ?
      `).all(query.grupo_id, query.fecha)
      return registros
    }

    if (query.grupo_id) {
      const fechas = db.prepare('SELECT DISTINCT fecha FROM asistencia WHERE grupo_id = ? ORDER BY fecha DESC').all(query.grupo_id)
      return fechas
    }

    return []
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const registros = body.registros

    const insert = db.prepare(`
      INSERT OR REPLACE INTO asistencia (estudiante_id, grupo_id, fecha, presente)
      VALUES (?, ?, ?, ?)
    `)

    const insertMany = db.transaction((registros) => {
      for (const r of registros) {
        insert.run(r.estudiante_id, r.grupo_id, r.fecha, r.presente ? 1 : 0)
      }
    })

    insertMany(registros)
    return { success: true }
  }
})