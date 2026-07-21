const SESSION_KEY = 'authSession'

let sessionPromise = null

export async function ensureSession() {
  const cached = getSessionSync()
  if (cached && cached.token && cached.uid) {
    return cached
  }

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
  // Try WeChat login — may fail on H5 or non-WeChat platforms
  let code
  try {
    const loginRes = await uni.login()
    code = loginRes.code
  } catch (e) {
    throw new Error('微信登录不可用: ' + (e.message || e))
  }

  if (!code) {
    throw new Error('uni.login failed: no code returned')
  }

  const res = await uniCloud.callFunction({
    name: 'uni-login',
    data: { code }
  })

  const { code: resultCode, message, token, uid } = res.result

  if (resultCode !== 0) {
    throw new Error(message || '登录失败')
  }

  const actualToken = typeof token === 'string' ? token : token.token
  const session = { token: actualToken, uid, loginTime: Date.now() }
  saveSession(session)
  return session
}

export function getSessionSync() {
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
