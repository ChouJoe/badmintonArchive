import { defineStore } from 'pinia'

const STORAGE_KEY = 'userProfile'

export const useUserStore = defineStore('user', {
  state: () => ({
    avatar: '',
    nickname: '',
    gender: '',
    level: 0,
    dominantHand: '',
  }),

  actions: {
    load() {
      try {
        const data = uni.getStorageSync(STORAGE_KEY)
        if (data) {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data
          this.avatar = parsed.avatar || ''
          this.nickname = parsed.nickname || ''
          this.gender = parsed.gender || ''
          this.level = parsed.level || 0
          this.dominantHand = parsed.dominantHand || ''
        }
      } catch (e) {
        // ignore
      }
    },

    save() {
      uni.setStorageSync(STORAGE_KEY, {
        avatar: this.avatar,
        nickname: this.nickname,
        gender: this.gender,
        level: this.level,
        dominantHand: this.dominantHand,
      })
    },

    updateProfile(data) {
      if (data.avatar !== undefined) this.avatar = data.avatar
      if (data.nickname !== undefined) this.nickname = data.nickname
      if (data.gender !== undefined) this.gender = data.gender
      if (data.level !== undefined) this.level = data.level
      if (data.dominantHand !== undefined) this.dominantHand = data.dominantHand
      this.save()
    },
  },
})
