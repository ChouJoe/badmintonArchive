import { defineStore } from 'pinia'
import * as cloud from '@/utils/cloud'

function mapDoc(doc) {
  return {
    ...doc,
    id: doc._id,
    equipId: doc.equipment_id,
    stringingId: doc.stringing_id,
    gripId: doc.grip_id
  }
}

export const useExpenseStore = defineStore('expense', {
  state: () => ({
    list: [],
    loaded: false,
    loading: false,
  }),

  getters: {
    getByEquipId: (state) => (equipId) =>
      state.list.filter(item => item.equipId === equipId || item.equipment_id === equipId),
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
    async load() {
      if (this.loaded) return
      this.loading = true
      try {
        const data = await cloud.getAll('expenses', { field: 'created_at', direction: 'desc' })
        this.list = data.map(mapDoc)
        this.loaded = true
      } catch (e) {
        console.error('Failed to load expenses:', e)
      } finally {
        this.loading = false
      }
    },

    async migrateFromEquipment(equipList) {
      let changed = false
      for (const equip of equipList) {
        if (!equip.price) continue
        const exists = this.list.some(
          e => e.equipId === equip.id && e.category === 'equipment'
        )
        if (!exists) {
          const record = {
            date: equip.buyDate || new Date().toISOString().split('T')[0],
            amount: equip.price,
            category: 'equipment',
            equipment_id: equip.id,
            note: `购买 ${equip.brand} ${equip.model}`
          }
          const docId = await cloud.add('expenses', record)
          this.list.unshift({ ...record, _id: docId, id: docId, equipId: equip.id })
          changed = true
        }
      }
      return changed
    },

    async add(record) {
      const { id, equipId, stringingId, gripId, ...data } = record
      const docId = await cloud.add('expenses', {
        ...data,
        equipment_id: equipId || data.equipment_id,
        stringing_id: stringingId || data.stringing_id,
        grip_id: gripId || data.grip_id,
      })
      this.list.unshift({
        ...data,
        equipment_id: equipId,
        stringing_id: stringingId,
        grip_id: gripId,
        _id: docId,
        id: docId,
        equipId: equipId,
        stringingId: stringingId,
        gripId: gripId,
      })
    },

    async update(id, data) {
      await cloud.update('expenses', id, data)
      const idx = this.list.findIndex(item => item.id === id || item._id === id)
      if (idx !== -1) {
        this.list[idx] = { ...this.list[idx], ...data }
      }
    },

    async remove(id) {
      await cloud.remove('expenses', id)
      this.list = this.list.filter(item => item.id !== id && item._id !== id)
    },

    async removeByEquipId(equipId) {
      await cloud.removeByField('expenses', 'equipment_id', equipId)
      this.list = this.list.filter(item => item.equipId !== equipId && item.equipment_id !== equipId)
    }
  }
})
