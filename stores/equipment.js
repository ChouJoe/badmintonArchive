import { defineStore } from 'pinia'
import * as storage from '@/utils/storage'

export const useEquipmentStore = defineStore('equipment', {
  state: () => ({
    list: [],
    loaded: false
  }),

  getters: {
    getById: (state) => (id) => state.list.find(item => item.id === id),
    count: (state) => state.list.length,
    activeList: (state) => state.list.filter(item => !item.retired),
    retiredList: (state) => state.list.filter(item => item.retired),
  },

  actions: {
    load() {
      this.list = storage.getEquipList()
      this.loaded = true
    },

    add(item) {
      storage.addEquip(item)
      this.list.unshift(item)
    },

    update(id, data) {
      storage.updateEquip(id, data)
      const idx = this.list.findIndex(item => item.id === id)
      if (idx !== -1) {
        this.list[idx] = { ...this.list[idx], ...data }
      }
    },

    remove(id) {
      storage.deleteEquip(id)
      this.list = this.list.filter(item => item.id !== id)
    },

    getEquipById(id) {
      return storage.getEquipById(id)
    }
  }
})
