import { defineStore } from 'pinia'
import * as cloud from '@/utils/cloud'
import { useUserStore, FREE_EQUIP_LIMIT } from './user'
import { resolveCloudUrl, resolveCloudUrls } from '@/utils/cloud-image'

function mapDoc(doc) {
  return { ...doc, id: doc._id }
}

async function resolveUserPhotos(items) {
  const fileIDs = items.filter(i => i.userPhoto).map(i => i.userPhoto)
  if (fileIDs.length === 0) return
  const urlMap = await resolveCloudUrls(fileIDs)
  items.forEach(item => {
    if (item.userPhoto && urlMap[item.userPhoto]) {
      item.userPhotoUrl = urlMap[item.userPhoto]
    }
  })
}

export const useEquipmentStore = defineStore('equipment', {
  state: () => ({
    list: [],
    loaded: false,
    loading: false,
  }),

  getters: {
    getById: (state) => (id) => state.list.find(item => item.id === id || item._id === id),
    count: (state) => state.list.length,
    activeList: (state) => state.list.filter(item => !item.retired),
    retiredList: (state) => state.list.filter(item => item.retired),
  },

  actions: {
    async load() {
      if (this.loaded) return
      this.loading = true
      try {
        const data = await cloud.getAll('equipment', { field: 'created_at', direction: 'desc' })
        const items = data.map(mapDoc)
        await resolveUserPhotos(items)
        this.list = items
        this.loaded = true
      } catch (e) {
        console.error('Failed to load equipment:', e)
      } finally {
        this.loading = false
      }
    },

    async add(item) {
      if (!this.loaded) await this.load()
      const userStore = useUserStore()
      if (!userStore.isVIP && this.list.length >= FREE_EQUIP_LIMIT) {
        uni.showModal({
          title: '已达免费限制',
          content: `免费用户最多添加 ${FREE_EQUIP_LIMIT} 件装备。升级完整版即可解除限制。`,
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/profile/vip' })
            }
          }
        })
        return
      }
      const { id, ...data } = item
      const docId = await cloud.add('equipment', data)
      const newItem = { ...data, _id: docId, id: docId }
      if (newItem.userPhoto) {
        newItem.userPhotoUrl = await resolveCloudUrl(newItem.userPhoto)
      }
      this.list.unshift(newItem)
    },

    async update(id, data) {
      await cloud.update('equipment', id, data)
      const idx = this.list.findIndex(item => item.id === id || item._id === id)
      if (idx !== -1) {
        const updated = { ...this.list[idx], ...data }
        if (data.userPhoto !== undefined) {
          updated.userPhotoUrl = data.userPhoto ? await resolveCloudUrl(data.userPhoto) : ''
        }
        this.list[idx] = updated
      }
    },

    async remove(id) {
      await cloud.remove('equipment', id)
      this.list = this.list.filter(item => item.id !== id && item._id !== id)
    },

    getEquipById(id) {
      return this.getById(id)
    }
  }
})
