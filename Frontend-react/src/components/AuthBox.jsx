import { useState } from 'react'

export default function AuthBox({ user, onLogin, onRegister, onLogout, loading }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')
    try {
      await onLogin?.({ email, password })
      setPassword('')
    } catch (e) {
      setError(e?.message || 'Đăng nhập thất bại')
    }
  }

  const handleRegister = async () => {
    setError('')
    try {
      await onRegister?.({ email, password })
      setPassword('')
    } catch (e) {
      setError(e?.message || 'Đăng ký thất bại')
    }
  }

  if (user) {
    return (
      <div className="rounded-xl border p-4 bg-white text-slate-800 flex items-center justify-between">
        <div className="text-sm">
          <div className="font-medium">Đã đăng nhập</div>
          <div>{user.email}{user.name ? ` • ${user.name}` : ''}</div>
        </div>
        <button className="rounded-2xl px-4 py-2 border bg-red-50 text-red-700" onClick={onLogout} disabled={loading}>
          Đăng xuất
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border p-4 bg-white text-slate-800">
      <div className="text-sm font-medium mb-2">Đăng nhập hoặc đăng ký</div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm">Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            className="rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Mật khẩu</span>
          <input
            type="password"
            placeholder="••••••"
            className="rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </label>
      </div>
      {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      <div className="flex gap-2 mt-3">
        <button className="rounded-2xl px-4 py-2 border bg-blue-50 text-blue-700" onClick={handleLogin} disabled={loading}>
          Đăng nhập
        </button>
        <button className="rounded-2xl px-4 py-2 border bg-gray-50 text-gray-700" onClick={handleRegister} disabled={loading}>
          Đăng ký nhanh
        </button>
      </div>
    </div>
  )
}

