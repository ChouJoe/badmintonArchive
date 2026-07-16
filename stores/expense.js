import { defineStore } from 'pinia'
import * as storage from '@/utils/storage'

export const useExpenseStore = defineStore('expense', {
  state: () => ({
    list: [],
    loaded: false
  }),

  getters: {
    getByEquipId: (state) => (equipId) =>
      state.list.filter(item => item.equipId === equipId),
    totalByCategory: (state) => (category) =>
      state.list
        .filter(item => item.category === category)
        .reduce((sum, item) => sum + item.amount, 0),
    totalAll: (state) =>
      state.list.reduce((sum, item) => sum + item.amount, 0),
    totalByYear: (state) => (year) =>
      state.list
        .filter(item => item.date && item.date.startsWith(String(year)))
        .reduce((sum, item) => sum + item.amount, 0),
    totalByMonth: (state) => (year, month) =>
      state.list
        .filter(item => item.date && item.date.startsWith(`${year}-${String(month).padStart(2, '0')}`))
        .reduce((sum, item) => sum + item.amount, 0),
    categorySummary: (state) => {
      const map = {}
      state.list.forEach(item => {
        map[item.category] = (map[item.category] || 0) + item.amount
      })
      return map
    },
    monthlySummary: (state) => {
      const map = {}
      state.list.forEach(item => {
        if (!item.date) return
        const key = item.date.substring(0, 7)
        map[key] = (map[key] || 0) + item.amount
      })
      return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, total]) => ({ month, total }))
    }
  },

  actions: {
    load() {
      this.list = storage.getExpenseList()
      this.loaded = true
    },

    migrateFromEquipment(equipList) {
      let changed = false
      equipList.forEach(equip => {
        if (!equip.price) return
        const exists = this.list.some(
          e => e.equipId === equip.id && e.category === 'equipment'
        )
        if (!exists) {
          const record = {
            id: Date.now() + equip.id,
            date: equip.buyDate || new Date().toISOString().split('T')[0],
            amount: equip.price,
            category: 'equipment',
            equipId: equip.id,
            note: `购买 ${equip.brand} ${equip.model}`
          }
          storage.addExpense(record)
          this.list.unshift(record)
          changed = true
        }
      })
      return changed
    },

    add(record) {
      storage.addExpense(record)
      this.list.unshift(record)
    },

    update(id, data) {
      storage.updateExpense(id, data)
      const idx = this.list.findIndex(item => item.id === id)
      if (idx !== -1) {
        this.list[idx] = { ...this.list[idx], ...data }
      }
    },

    remove(id) {
      storage.deleteExpense(id)
      this.list = this.list.filter(item => item.id !== id)
    },

    removeByEquipId(equipId) {
      const ids = this.list
        .filter(item => item.equipId === equipId)
        .map(item => item.id)
      ids.forEach(id => storage.deleteExpense(id))
      this.list = this.list.filter(item => item.equipId !== equipId)
    }
  }
})
