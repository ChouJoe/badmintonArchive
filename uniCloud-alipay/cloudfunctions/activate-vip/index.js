const ADMIN_KEY = 'badminton-admin'

exports.main = async (event, context) => {
  const { adminKey, userId } = event

  if (adminKey !== ADMIN_KEY) {
    return { code: 403, message: '管理员密钥不正确' }
  }

  if (!userId) {
    return { code: 1, message: '请提供用户 ID' }
  }

  const db = uniCloud.database()
  const col = db.collection('ba-profiles')

  const res = await col.where({ user_id: userId }).limit(1).get()

  if (!res.data || res.data.length === 0) {
    return { code: 1, message: `未找到用户 ID 为 "${userId}" 的用户` }
  }

  const profile = res.data[0]
  await col.doc(profile._id).update({
    vip: true,
    vip_activated_at: Date.now(),
    updated_at: Date.now()
  })

  return {
    code: 0,
    message: `已激活用户 [${profile.nickname || userId}] 的完整版`,
    userId: profile.user_id,
    nickname: profile.nickname
  }
}
