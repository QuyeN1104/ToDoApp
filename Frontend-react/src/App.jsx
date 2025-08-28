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
  const [mode, setMode] = useState('unknown') // 'local' | 'api'
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [todos, setTodos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const fetchTodos = async (term) => {
    if (mode !== 'api') return
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
    if (!title?.trim()) return
    if (mode === 'api') {
      const created = await apiCreateTodo({ title: title.trim(), deadline: deadline || null })
      setTodos(prev => [created, ...prev])
      return
    }
    const id = Date.now()
    setTodos((prev) => [
      { id, title: title.trim(), deadline: deadline || new Date().toISOString(), done: false },
      ...prev,
    ])
  }

  const toggleTodo = async (id) => {
    if (mode === 'api') {
      const cur = todos.find(t => t.id === id)
      if (!cur) return
      const updated = await apiUpdateTodo(id, { done: !cur.done })
      setTodos(prev => prev.map(t => t.id === id ? updated : t))
      return
    }
    setTodos((prev) => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const deleteTodo = async (id) => {
    if (mode === 'api') {
      await apiDeleteTodo(id)
      setTodos(prev => prev.filter(t => t.id !== id))
      return
    }
    setTodos((prev) => prev.filter(t => t.id !== id))
  }

  const onSearch = (term) => {
    const next = term ?? ''
    setSearchTerm(next)
    if (mode === 'api') fetchTodos(next)
  }

  const shownTodos = mode === 'api'
    ? todos
    : todos
        .filter(t =>
          !searchTerm
            ? true
            : t.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice()
        .sort((a, b) => {
          if (a.done !== b.done) return a.done ? 1 : -1
          const da = new Date(a.deadline).getTime() || 0
          const db = new Date(b.deadline).getTime() || 0
          return da - db
        })

  // Auth bootstrap: decide mode and try to fetch user + todos if token exists
  useEffect(() => {
    const token = getAccessToken?.()
    if (token) {
      setMode('api')
      ;(async () => {
        try {
          const u = await me()
          setUser(u)
          await fetchTodos(searchTerm)
        } catch {
          // token invalid → fallback to local
          setMode('local')
        }
      })()
    } else {
      setMode('local')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Local mode: bootstrap from localStorage
  useEffect(() => {
    if (mode !== 'local') return
    try {
      const raw = localStorage.getItem('todos')
      const saved = raw ? JSON.parse(raw) : null
      if (Array.isArray(saved)) setTodos(saved)
      const savedSearch = localStorage.getItem('searchTerm')
      if (typeof savedSearch === 'string') setSearchTerm(savedSearch)
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // Persist local mode changes
  useEffect(() => {
    if (mode !== 'local') return
    try { localStorage.setItem('todos', JSON.stringify(todos)) } catch {}
  }, [todos, mode])
  useEffect(() => {
    if (mode !== 'local') return
    try { localStorage.setItem('searchTerm', searchTerm) } catch {}
  }, [searchTerm, mode])

  const handleLogin = async ({ email, password }) => {
    setLoading(true)
    try {
      const res = await apiLogin({ email, password })
      setUser(res?.user || null)
      setMode('api')
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
      setMode('local')
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
          onAdd={addTodo}
          onSearch={onSearch}
          searchTerm={searchTerm}
          resultsCount={shownTodos.length}
        />
        {loading && mode === 'api' ? (
          <div className="rounded-xl border p-4 bg-white text-slate-500">Đang tải dữ liệu...</div>
        ) : (
          <TodoList todos={shownTodos} onToggle={toggleTodo} onDelete={deleteTodo} />
        )}
      </main>

      <footer className="mt-auto text-center bg-blue-400 mx-2 rounded-2xl flex justify-center border-2 gap-2 py-2">
        <span>Powered by Nguyen Phuc Dinh Quyen</span>
      </footer>
    </div>
  )
}

