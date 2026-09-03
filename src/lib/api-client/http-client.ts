import axios from 'axios'
import { env } from '@/lib/env'
import { useAuthStore } from '@/lib/store/auth-store'

/**
 * The ONLY place that should ever call `axios` directly. Module API
 * files (e.g. `modules/leads/api/leads-api.ts`) call through this
 * instance, never `fetch`/`axios` directly, so auth headers, error
 * shape, and the mock/real switch stay centralized.
 */
export const httpClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 15000,
})

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession()
    }
    return Promise.reject(error)
  },
)
