import db from './db.js'

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    const grupos = db.prepare('SELECT * FROM grupos ORDER BY created_at DESC').all()
    return grupos
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const stmt = db.prepare('INSERT INTO grupos (nombre, materia) VALUES (?, ?)')
    const result = stmt.run(body.nombre, body.materia)
    return { id: result.lastInsertRowid, nombre: body.nombre, materia: body.materia }
  }

  if (method === 'DELETE') {
    const body = await readBody(event)
    db.prepare('DELETE FROM estudiantes WHERE grupo_id = ?').run(body.id)
    db.prepare('DELETE FROM asistencia WHERE grupo_id = ?').run(body.id)
    db.prepare('DELETE FROM grupos WHERE id = ?').run(body.id)
    return { success: true }
  }
})