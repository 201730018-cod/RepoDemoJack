const tasks = []
let nextId = 1

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    return tasks
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const newTask = {
      id: nextId++,
      title: body.title,
      completed: false,
      favorite: false
    }
    tasks.push(newTask)
    return newTask
  }

  if (method === 'PUT') {
    const body = await readBody(event)
    const index = tasks.findIndex(t => t.id === body.id)
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...body }
      return tasks[index]
    }
    return { error: 'Tarea no encontrada' }
  }

  if (method === 'DELETE') {
    const body = await readBody(event)
    const index = tasks.findIndex(t => t.id === body.id)
    if (index !== -1) {
      tasks.splice(index, 1)
      return { success: true }
    }
    return { error: 'Tarea no encontrada' }
  }
})