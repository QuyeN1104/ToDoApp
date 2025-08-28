// Centralized runtime configuration for API access
// Prefer proxy path '/api' in dev; allow override via VITE_API_URL for prod.

export const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const STORAGE_KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  user: 'auth_user',
}

