import db from './db.js'

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    const query = getQuery(event)
    const estudiantes = db.prepare('SELECT * FROM estudiantes WHERE grupo_id = ? ORDER BY nombre').all(query.grupo_id)
    return estudiantes
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const stmt = db.prepare('INSERT INTO estudiantes (nombre, matricula, grupo_id) VALUES (?, ?, ?)')
    const result = stmt.run(body.nombre, body.matricula, body.grupo_id)
    return { id: result.lastInsertRowid, nombre: body.nombre, matricula: body.matricula, grupo_id: body.grupo_id }
  }

  if (method === 'DELETE') {
    const body = await readBody(event)
    db.prepare('DELETE FROM asistencia WHERE estudiante_id = ?').run(body.id)
    db.prepare('DELETE FROM estudiantes WHERE id = ?').run(body.id)
    return { success: true }
  }
})