import { defineStore } from 'pinia'
import * as cloud from '@/utils/cloud'

const LOCAL_KEY = 'userProfile'

async function resolveAvatarUrl(avatar) {
  if (avatar && avatar.startsWith('cloud://')) {
    try {
      const r = await uniCloud.getTempFileURL({
        fileList: [avatar]
      })
      const url = r.fileList?.[0]?.tempFileURL
      if (url && !url.startsWith('cloud://')) {
        return url
      }
    } catch (e) {
      console.error('getTempFileURL failed:', e)
    }
    const match = avatar.match(/^cloud:\/\/([^/]+)\/(.+)$/)
    if (match) {
      return `https://${match[1]}.normal.cloudstatic.cn/${match[2]}`
    }
    return ''
  }
  return avatar || ''
}

export const useUserStore = defineStore('user', {
  state: () => ({
    avatar: '',
    avatarFileID: '',
    nickname: '',
    gender: '',
    level: 0,
    dominantHand: '',
    loaded: false,
  }),

  getters: {
    profileDoc: (state) => ({
      avatar: state.avatarFileID || state.avatar,
      nickname: state.nickname,
      gender: state.gender,
      level: state.level,
      dominantHand: state.dominantHand,
    })
  },

  actions: {
    async load() {
      try {
        const profiles = await cloud.getAll('profile')
        if (profiles.length > 0) {
          const p = profiles[0]
          this.avatarFileID = p.avatar && p.avatar.startsWith('cloud://') ? p.avatar : ''
          this.avatar = await resolveAvatarUrl(p.avatar)
          this.nickname = p.nickname || ''
          this.gender = p.gender || ''
          this.level = p.level || 0
          this.dominantHand = p.dominantHand || ''
        } else {
          const local = this._loadLocal()
          if (local) Object.assign(this, local)
        }
        this.loaded = true
      } catch (e) {
        console.error('Failed to load profile:', e)
        const local = this._loadLocal()
        if (local) Object.assign(this, local)
        this.loaded = true
      }
    },

    async save() {
      try {
        const profiles = await cloud.getAll('profile')
        const data = {
          avatar: this.avatarFileID || this.avatar,
          nickname: this.nickname,
          gender: this.gender,
          level: this.level,
          dominantHand: this.dominantHand,
          updated_at: Date.now()
        }
        if (profiles.length > 0) {
          await cloud.update('profile', profiles[0]._id, data)
        } else {
          await cloud.add('profile', data)
        }
      } catch (e) {
        console.error('Failed to save profile to cloud:', e)
      }
      this._saveLocal()
    },

    async updateProfile(data) {
      if (data.avatar !== undefined) {
        if (data.avatar.startsWith('cloud://')) {
          this.avatarFileID = data.avatar
          this.avatar = await resolveAvatarUrl(data.avatar)
        } else {
          this.avatar = data.avatar
          this.avatarFileID = ''
        }
      }
      if (data.nickname !== undefined) this.nickname = data.nickname
      if (data.gender !== undefined) this.gender = data.gender
      if (data.level !== undefined) this.level = data.level
      if (data.dominantHand !== undefined) this.dominantHand = data.dominantHand
      await this.save()
    },

    _loadLocal() {
      try {
        const raw = uni.getStorageSync(LOCAL_KEY)
        if (!raw) return null
        return typeof raw === 'string' ? JSON.parse(raw) : raw
      } catch {
        return null
      }
    },

    _saveLocal() {
      uni.setStorageSync(LOCAL_KEY, {
        avatar: this.avatar,
        nickname: this.nickname,
        gender: this.gender,
        level: this.level,
        dominantHand: this.dominantHand,
      })
    }
  }
})
