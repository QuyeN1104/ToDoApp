// Lightweight HTTP client with token handling and JSON helpers.
// Prepares for multi-user via JWT (access/refresh tokens).

import { API_BASE, STORAGE_KEYS } from '../config'

let accessTokenCache = null
let refreshTokenCache = null

// Token storage helpers
export function setAccessToken(token) {
  accessTokenCache = token || null
  try { token ? localStorage.setItem(STORAGE_KEYS.accessToken, token) : localStorage.removeItem(STORAGE_KEYS.accessToken) } catch {}
}

export function getAccessToken() {
  if (accessTokenCache) return accessTokenCache
  try { accessTokenCache = localStorage.getItem(STORAGE_KEYS.accessToken) } catch {}
  return accessTokenCache
}

export function setRefreshToken(token) {
  refreshTokenCache = token || null
  try { token ? localStorage.setItem(STORAGE_KEYS.refreshToken, token) : localStorage.removeItem(STORAGE_KEYS.refreshToken) } catch {}
}

export function getRefreshToken() {
  if (refreshTokenCache) return refreshTokenCache
  try { refreshTokenCache = localStorage.getItem(STORAGE_KEYS.refreshToken) } catch {}
  return refreshTokenCache
}

export function clearTokens() {
  accessTokenCache = null
  refreshTokenCache = null
  try {
    localStorage.removeItem(STORAGE_KEYS.accessToken)
    localStorage.removeItem(STORAGE_KEYS.refreshToken)
  } catch {}
}

function toQuery(params) {
  if (!params) return ''
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    if (Array.isArray(v)) v.forEach((item) => sp.append(k, String(item)))
    else sp.set(k, String(v))
  })
  const s = sp.toString()
  return s ? `?${s}` : ''
}

async function doFetch(method, path, { query, body, headers, signal } = {}) {
  const url = `${API_BASE}${path}${toQuery(query)}`
  const hasBody = body !== undefined && body !== null
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData

  const h = new Headers({ Accept: 'application/json', ...(headers || {}) })
  if (hasBody && !isForm) h.set('Content-Type', 'application/json')

  const token = getAccessToken()
  if (token) h.set('Authorization', `Bearer ${token}`)

  const res = await fetch(url, {
    method,
    headers: h,
    body: hasBody ? (isForm ? body : JSON.stringify(body)) : undefined,
    signal,
    credentials: 'include', // allow cookie-based auth if used
  })

  const isJSON = res.headers.get('content-type')?.includes('application/json')
  const data = isJSON ? await res.json().catch(() => null) : await res.text()

  if (!res.ok) {
    const err = new Error(data?.detail || data?.message || res.statusText)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

// Optional: refresh flow (retry once on 401)
let refreshing = null
async function refreshTokensOnce() {
  if (refreshing) return refreshing
  const rt = getRefreshToken()
  if (!rt) throw new Error('No refresh token')
  refreshing = doFetch('POST', '/auth/refresh', { body: { refresh_token: rt } })
    .then((res) => {
      if (res?.access_token) setAccessToken(res.access_token)
      if (res?.refresh_token) setRefreshToken(res.refresh_token)
      return res
    })
    .finally(() => { refreshing = null })
  return refreshing
}

export async function request(method, path, opts = {}) {
  try {
    return await doFetch(method, path, opts)
  } catch (err) {
    if (err?.status === 401 && getRefreshToken()) {
      try {
        await refreshTokensOnce()
        return await doFetch(method, path, opts)
      } catch (e2) {
        // If refresh fails, clear tokens and rethrow
        clearTokens()
        throw e2
      }
    }
    throw err
  }
}

export const http = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, opts) => request('POST', path, opts),
  patch: (path, opts) => request('PATCH', path, opts),
  put: (path, opts) => request('PUT', path, opts),
  del: (path, opts) => request('DELETE', path, opts),
}

