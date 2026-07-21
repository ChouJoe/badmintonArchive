import { defineStore } from 'pinia'
import * as cloud from '@/utils/cloud'

function mapDoc(doc) {
  return { ...doc, id: doc._id }
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
        this.list = data.map(mapDoc)
        this.loaded = true
      } catch (e) {
        console.error('Failed to load equipment:', e)
      } finally {
        this.loading = false
      }
    },

    async add(item) {
      const { id, ...data } = item
      const docId = await cloud.add('equipment', data)
      this.list.unshift({ ...data, _id: docId, id: docId })
    },

    async update(id, data) {
      await cloud.update('equipment', id, data)
      const idx = this.list.findIndex(item => item.id === id || item._id === id)
      if (idx !== -1) {
        this.list[idx] = { ...this.list[idx], ...data }
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
