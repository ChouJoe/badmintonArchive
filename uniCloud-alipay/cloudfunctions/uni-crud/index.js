const COLLECTIONS = {
  equipment: 'ba-equipment',
  stringing: 'ba-stringing',
  grip: 'ba-grip',
  expenses: 'ba-expenses',
  profile: 'ba-profiles',
}

exports.main = async (event, context) => {
  const { action, collection, data, id, field, value, orderBy } = event

  if (!COLLECTIONS[collection]) {
    return { code: 1, message: `Invalid collection: ${collection}` }
  }

  const uniID = require('uni-id-common')
  const uniIDIns = uniID.createInstance({ context })

  console.log('uni-crud token:', event.token ? event.token?.substring(0, 20) + '...' : 'MISSING', 'length:', event.token ? event.token.length : 0)

  let uid
  try {
    const tokenRes = await uniIDIns.checkToken(event.token)
    console.log('uni-crud checkToken result:', JSON.stringify(tokenRes))
    if (tokenRes.uid) {
      uid = tokenRes.uid
    } else {
      return { code: 401, message: 'Invalid token - uid missing in payload' }
    }
  } catch (e) {
    console.error('uni-crud checkToken error:', JSON.stringify(e, Object.getOwnPropertyNames(e)))
    return { code: 401, message: 'Token verification failed', detail: e.errCode || String(e) }
  }

  const db = uniCloud.database()
  const col = db.collection(COLLECTIONS[collection])

  try {
    switch (action) {
      case 'get': {
        let query = col.where({ user_id: uid })
        if (orderBy) {
          query = query.orderBy(orderBy.field, orderBy.direction || 'desc')
        }
        const res = await query.get()
        return { code: 0, data: res.data || [] }
      }

      case 'getById': {
        const res = await col.where({ _id: id, user_id: uid }).get()
        return { code: 0, data: res.data && res.data[0] ? res.data[0] : null }
      }

      case 'getByField': {
        let query = col.where({ [field]: value, user_id: uid })
        if (orderBy) {
          query = query.orderBy(orderBy.field, orderBy.direction || 'desc')
        }
        const res = await query.get()
        return { code: 0, data: res.data || [] }
      }

      case 'add': {
        const payload = {
          ...data,
          user_id: uid,
          created_at: Date.now(),
          updated_at: Date.now(),
        }
        if (event.id) {
          payload._id = event.id
        }
        const res = await col.add(payload)
        return { code: 0, id: res.id }
      }

      case 'update': {
        const doc = await col.where({ _id: id, user_id: uid }).get()
        if (!doc.data || doc.data.length === 0) {
          return { code: 403, message: 'Not found or no permission' }
        }
        await col.doc(id).update({ ...data, updated_at: Date.now() })
        return { code: 0 }
      }

      case 'remove': {
        const doc = await col.where({ _id: id, user_id: uid }).get()
        if (!doc.data || doc.data.length === 0) {
          return { code: 403, message: 'Not found or no permission' }
        }
        await col.doc(id).remove()
        return { code: 0 }
      }

      case 'removeByField': {
        const items = await col.where({ [field]: value, user_id: uid }).get()
        const ids = (items.data || []).map(item => item._id)
        if (ids.length > 0) {
          await col.where({ _id: db.command.in(ids), user_id: uid }).remove()
        }
        return { code: 0 }
      }

      default:
        return { code: 1, message: `Unknown action: ${action}` }
    }
  } catch (e) {
    return { code: 2, message: e.message || String(e) }
  }
}
