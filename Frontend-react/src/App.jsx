import './App.css'

import Header from './components/Header'
import ControlBar from './components/ControlBar'
import TodoList from './components/TodoList'
import AuthBox from './components/AuthBox'
import { useEffect, useState } from 'react'
import { login as apiLogin, register as apiRegister, logout as apiLogout, me } from './api/auth'
import { listTodos, createTodo as apiCreateTodo, updateTodo as apiUpdateTodo, deleteTodo as apiDeleteTodo } from './api/todos'
import { getAccessToken } from './api/http'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [todos, setTodos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const fetchTodos = async (term) => {
    if (!user) return
    setLoading(true)
    try {
      const data = await listTodos({
        search: term || undefined,
        order_by: 'deadline',
        order: 'asc',
        limit: 200,
      })
      setTodos(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (title, deadline) => {
    if (!title?.trim() || !user) return
    const created = await apiCreateTodo({ title: title.trim(), deadline: deadline || null })
    setTodos(prev => [created, ...prev])
  }

  const toggleTodo = async (id) => {
    if (!user) return
    const cur = todos.find(t => t.id === id)
    if (!cur) return
    const updated = await apiUpdateTodo(id, { done: !cur.done })
    setTodos(prev => prev.map(t => t.id === id ? updated : t))
  }

  const deleteTodo = async (id) => {
    if (!user) return
    await apiDeleteTodo(id)
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  const onSearch = (term) => {
    const next = term ?? ''
    setSearchTerm(next)
    if (user) fetchTodos(next)
  }

  useEffect(() => {
    const token = getAccessToken?.()
    if (token) {
      ;(async () => {
        try {
          const u = await me()
          setUser(u)
          await fetchTodos(searchTerm)
        } catch {}
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = async ({ email, password }) => {
    setLoading(true)
    try {
      const res = await apiLogin({ email, password })
      setUser(res?.user || null)
      await fetchTodos(searchTerm)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async ({ email, password }) => {
    setLoading(true)
    try {
      await apiRegister({ email, password })
      await handleLogin({ email, password })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await apiLogout()
      setUser(null)
      setTodos([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="grow p-4 space-y-3">
        <AuthBox user={user} onLogin={handleLogin} onRegister={handleRegister} onLogout={handleLogout} loading={loading} />
        <ControlBar
          onAdd={user ? addTodo : undefined}
          onSearch={user ? onSearch : undefined}
          searchTerm={searchTerm}
          resultsCount={todos.length}
          disabled={!user || loading}
        />
        {loading && user ? (
          <div className="rounded-xl border p-4 bg-white text-slate-500">Đang tải dữ liệu...</div>
        ) : user ? (
          <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
        ) : (
          <div className="rounded-xl border p-4 bg-white text-slate-500">Vui lòng đăng nhập để sử dụng ứng dụng.</div>
        )}
      </main>

      <footer className="mt-auto text-center bg-blue-400 mx-2 rounded-2xl flex justify-center border-2 gap-2 py-2">
        <span>Powered by Nguyen Phuc Dinh Quyen</span>
      </footer>
    </div>
  )
}

