import { defineStore } from 'pinia'
import * as cloud from '@/utils/cloud'
import { useUserStore, FREE_STRINGING_LIMIT } from './user'

function mapDoc(doc) {
  return { ...doc, id: doc._id, equipId: doc.equipment_id }
}

export const useStringingStore = defineStore('stringing', {
  state: () => ({
    list: [],
    loaded: false,
    loading: false,
  }),

  getters: {
    getByEquipId: (state) => (equipId) =>
      state.list.filter(item => item.equipId === equipId || item.equipment_id === equipId),
    countByEquipId: (state) => (equipId) =>
      state.list.filter(item => item.equipId === equipId || item.equipment_id === equipId).length,
    totalCostByEquipId: (state) => (equipId) =>
      state.list
        .filter(item => item.equipId === equipId || item.equipment_id === equipId)
        .reduce((sum, item) => sum + (item.price || 0), 0),
  },

  actions: {
    async load() {
      if (this.loaded) return
      this.loading = true
      try {
        const data = await cloud.getAll('stringing', { field: 'created_at', direction: 'desc' })
        this.list = data.map(mapDoc)
        this.loaded = true
      } catch (e) {
        console.error('Failed to load stringing:', e)
      } finally {
        this.loading = false
      }
    },

    async add(record) {
      if (!this.loaded) await this.load()
      const userStore = useUserStore()
      if (!userStore.isVIP && this.list.length >= FREE_STRINGING_LIMIT) {
        uni.showModal({
          title: '已达免费限制',
          content: `免费用户最多添加 ${FREE_STRINGING_LIMIT} 条穿线记录。升级完整版即可解除限制。`,
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/profile/vip' })
            }
          }
        })
        return
      }
      const { id, equipId, ...data } = record
      const docId = await cloud.add('stringing', { ...data, equipment_id: equipId || data.equipment_id })
      this.list.unshift({ ...data, equipment_id: equipId, _id: docId, id: docId, equipId: equipId })
    },

    async update(id, data) {
      await cloud.update('stringing', id, data)
      const idx = this.list.findIndex(item => item.id === id || item._id === id)
      if (idx !== -1) {
        this.list[idx] = { ...this.list[idx], ...data }
      }
    },

    async remove(id) {
      await cloud.remove('stringing', id)
      this.list = this.list.filter(item => item.id !== id && item._id !== id)
    },

    async removeByEquipId(equipId) {
      await cloud.removeByField('stringing', 'equipment_id', equipId)
      this.list = this.list.filter(item => item.equipId !== equipId && item.equipment_id !== equipId)
    }
  }
})
