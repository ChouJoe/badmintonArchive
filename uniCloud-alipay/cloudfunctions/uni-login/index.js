const crypto = require('crypto')

exports.main = async (event, context) => {
  const { code } = event

  if (!code) {
    return { code: 1, message: '缺少 code 参数' }
  }

  const wxRes = await uniCloud.httpclient.request(
    'https://api.weixin.qq.com/sns/jscode2session',
    {
      method: 'GET',
      dataType: 'json',
      data: {
        appid: 'wx5292da5f562a09ba',
        secret: '636d389a8159ddb0cba25a2a84a33b0b',
        js_code: code,
        grant_type: 'authorization_code'
      }
    }
  )

  const { openid, session_key, errcode, errmsg } = wxRes.data

  if (!openid) {
    return { code: 2, message: '微信登录失败', detail: { errcode, errmsg } }
  }

  const db = uniCloud.database()
  const users = db.collection('uni-id-users')

  let userRecord = await users.where({ wx_openid: openid }).get()
  let uid

  if (userRecord.data.length === 0) {
    const res = await users.add({
      wx_openid: openid,
      wx_session_key: session_key,
      nickname: '',
      avatar_file: '',
      register_date: Date.now(),
      register_ip: context.CLIENTIP || ''
    })
    uid = res.id
  } else {
    uid = userRecord.data[0]._id
    await users.doc(uid).update({
      wx_session_key: session_key,
      last_login_date: Date.now()
    })
  }

  const uniID = require('uni-id-common')
  const uniIDIns = uniID.createInstance({ context })
  const tokenResult = await uniIDIns.createToken({
    uid,
    type: 'user'
  })

  return {
    code: 0,
    message: '登录成功',
    token: tokenResult.token || tokenResult,
    uid
  }
}
