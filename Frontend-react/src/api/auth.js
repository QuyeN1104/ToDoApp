import { http, setAccessToken, setRefreshToken, clearTokens } from './http'
import { STORAGE_KEYS } from '../config'

export async function register({ email, password, name }) {
  return http.post('/auth/register', { body: { email, password, name } })
}

export async function login({ email, password }) {
  const res = await http.post('/auth/login', { body: { email, password } })
  if (res?.access_token) setAccessToken(res.access_token)
  if (res?.refresh_token) setRefreshToken(res.refresh_token)
  try { if (res?.user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(res.user)) } catch {}
  return res
}

export async function logout() {
  try { await http.post('/auth/logout') } catch { /* ignore */ }
  clearTokens()
  try { localStorage.removeItem(STORAGE_KEYS.user) } catch {}
}

export async function me() {
  return http.get('/auth/me')
}

