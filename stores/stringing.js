import { defineStore } from 'pinia'
import * as storage from '@/utils/storage'

export const useStringingStore = defineStore('stringing', {
  state: () => ({
    list: [],
    loaded: false
  }),

  getters: {
    getByEquipId: (state) => (equipId) =>
      state.list.filter(item => item.equipId === equipId),
    countByEquipId: (state) => (equipId) =>
      state.list.filter(item => item.equipId === equipId).length,
    totalCostByEquipId: (state) => (equipId) =>
      state.list
        .filter(item => item.equipId === equipId)
        .reduce((sum, item) => sum + (item.price || 0), 0),
  },

  actions: {
    load() {
      this.list = storage.getStringingList()
      this.loaded = true
    },

    add(record) {
      storage.addStringing(record)
      this.list.unshift(record)
    },

    update(id, data) {
      storage.updateStringing(id, data)
      const idx = this.list.findIndex(item => item.id === id)
      if (idx !== -1) {
        this.list[idx] = { ...this.list[idx], ...data }
      }
    },

    remove(id) {
      storage.deleteStringing(id)
      this.list = this.list.filter(item => item.id !== id)
    },

    removeByEquipId(equipId) {
      const ids = this.list
        .filter(item => item.equipId === equipId)
        .map(item => item.id)
      ids.forEach(id => storage.deleteStringing(id))
      this.list = this.list.filter(item => item.equipId !== equipId)
    }
  }
})
