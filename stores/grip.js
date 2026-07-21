import { defineStore } from 'pinia'
import * as cloud from '@/utils/cloud'

function mapDoc(doc) {
  return { ...doc, id: doc._id, equipId: doc.equipment_id }
}

export const useGripStore = defineStore('grip', {
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
        const data = await cloud.getAll('grip', { field: 'created_at', direction: 'desc' })
        this.list = data.map(mapDoc)
        this.loaded = true
      } catch (e) {
        console.error('Failed to load grip:', e)
      } finally {
        this.loading = false
      }
    },

    async add(record) {
      const { id, equipId, ...data } = record
      const docId = await cloud.add('grip', { ...data, equipment_id: equipId || data.equipment_id })
      this.list.unshift({ ...data, equipment_id: equipId, _id: docId, id: docId, equipId: equipId })
    },

    async update(id, data) {
      await cloud.update('grip', id, data)
      const idx = this.list.findIndex(item => item.id === id || item._id === id)
      if (idx !== -1) {
        this.list[idx] = { ...this.list[idx], ...data }
      }
    },

    async remove(id) {
      await cloud.remove('grip', id)
      this.list = this.list.filter(item => item.id !== id && item._id !== id)
    },

    async removeByEquipId(equipId) {
      await cloud.removeByField('grip', 'equipment_id', equipId)
      this.list = this.list.filter(item => item.equipId !== equipId && item.equipment_id !== equipId)
    }
  }
})
