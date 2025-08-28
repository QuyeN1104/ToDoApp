import { http } from './http'

// Query: { search, status, limit, offset, orderBy }
export function listTodos(query) {
  return http.get('/todos', { query })
}

export function createTodo({ title, deadline }) {
  return http.post('/todos', { body: { title, deadline } })
}

export function updateTodo(id, patch) {
  return http.patch(`/todos/${id}`, { body: patch })
}

export function deleteTodo(id) {
  return http.del(`/todos/${id}`)
}

