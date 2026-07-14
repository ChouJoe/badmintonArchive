/**
 * Silent authentication utility for WeChat Mini Program.
 *
 * Flow:
 *   1. On first API call, check if we have a valid session (code/openId).
 *   2. If not, call uni.login() silently (no user interaction needed).
 *   3. Send the code to the backend to exchange for openId + session_key.
 *   4. Cache the session locally so subsequent calls skip login.
 *
 * Usage:
 *   import { request } from '@/utils/auth'
 *   const data = await request({ url: '/api/equipment', method: 'GET' })
 *
 * The `request()` wrapper automatically ensures a valid session before
 * making the actual API call. If the session expires (backend returns 401),
 * it re-authenticates and retries once.
 */

const SESSION_KEY = 'authSession'

// Backend base URL — configure when backend is ready
const BASE_URL = ''

let sessionPromise = null

/**
 * Get or create a valid session (code + openId).
 * Multiple concurrent callers will share the same login promise.
 */
export async function ensureSession() {
  // Return cached session if available
  const cached = getSessionSync()
  if (cached && cached.openId) {
    return cached
  }

  // Deduplicate concurrent login calls
  if (sessionPromise) return sessionPromise

  sessionPromise = _doLogin()
  try {
    const session = await sessionPromise
    return session
  } finally {
    sessionPromise = null
  }
}

async function _doLogin() {
  const loginRes = await uni.login()
  const code = loginRes.code

  if (!code) {
    throw new Error('uni.login failed: no code returned')
  }

  // TODO: When backend is ready, exchange code for openId + session token.
  // For now, store the code and use it as a placeholder session.
  //
  // const res = await uni.request({
  //   url: `${BASE_URL}/auth/login`,
  //   method: 'POST',
  //   data: { code },
  // })
  // const { openId, token } = res.data

  const session = {
    code,
    openId: '', // Will be filled by backend response
    token: '',  // Will be filled by backend response
    loginTime: Date.now(),
  }

  saveSession(session)
  return session
}

/**
 * Authenticated request wrapper.
 * Ensures valid session, attaches auth header, retries on 401.
 */
export async function request(options) {
  const session = await ensureSession()

  const res = await uni.request({
    ...options,
    url: (options.baseUrl || BASE_URL) + options.url,
    header: {
      ...options.header,
      ...(session.token ? { Authorization: `Bearer ${session.token}` } : {}),
    },
  })

  // If 401, clear session and retry once
  if (res.statusCode === 401) {
    clearSession()
    const newSession = await ensureSession()
    const retryRes = await uni.request({
      ...options,
      url: (options.baseUrl || BASE_URL) + options.url,
      header: {
        ...options.header,
        ...(newSession.token ? { Authorization: `Bearer ${newSession.token}` } : {}),
      },
    })
    return retryRes.data
  }

  return res.data
}

/**
 * Get the current login code (for components that just need the code).
 */
export async function getLoginCode() {
  const session = await ensureSession()
  return session.code
}

// --- Storage helpers ---

function getSessionSync() {
  try {
    const data = uni.getStorageSync(SESSION_KEY)
    if (!data) return null
    return typeof data === 'string' ? JSON.parse(data) : data
  } catch {
    return null
  }
}

function saveSession(session) {
  uni.setStorageSync(SESSION_KEY, session)
}

export function clearSession() {
  uni.removeStorageSync(SESSION_KEY)
}
