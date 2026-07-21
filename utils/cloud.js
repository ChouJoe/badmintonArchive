import { ensureSession, clearSession } from './auth'

async function call(action, params = {}) {
  const session = await ensureSession()
  const res = await uniCloud.callFunction({
    name: 'uni-crud',
    data: { token: session.token, action, ...params }
  })
  if (res.result.code === 401) {
    clearSession()
    const newSession = await ensureSession()
    if (!newSession || !newSession.token) {
      throw new Error('登录失效，请重新打开小程序')
    }
    const retry = await uniCloud.callFunction({
      name: 'uni-crud',
      data: { token: newSession.token, action, ...params }
    })
    if (retry.result.code === 401) {
      clearSession()
      throw new Error('登录已过期，请重新打开小程序')
    }
    return retry.result
  }
  if (res.result.code !== 0) {
    throw new Error(res.result.message || 'Operation failed')
  }
  return res.result
}

export async function getAll(collectionKey, orderBy) {
  const result = await call('get', { collection: collectionKey, orderBy })
  return result.data || []
}

export async function getById(collectionKey, id) {
  const result = await call('getById', { collection: collectionKey, id })
  return result.data
}

export async function getByField(collectionKey, field, value, orderBy) {
  const result = await call('getByField', { collection: collectionKey, field, value, orderBy })
  return result.data || []
}

export async function add(collectionKey, data, _id) {
  const result = await call('add', { collection: collectionKey, data, id: _id })
  return result.id
}

export async function update(collectionKey, id, data) {
  await call('update', { collection: collectionKey, id, data })
}

export async function remove(collectionKey, id) {
  await call('remove', { collection: collectionKey, id })
}

export async function removeByField(collectionKey, field, value) {
  await call('removeByField', { collection: collectionKey, field, value })
}
