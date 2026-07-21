import * as storage from './storage'
import * as cloud from './cloud'
import { ensureSession } from './auth'

const MIGRATED_KEY = 'data_migrated_v1'

function isMigrated() {
  try { return !!uni.getStorageSync(MIGRATED_KEY) } catch { return false }
}

function setMigrated() {
  uni.setStorageSync(MIGRATED_KEY, true)
}

function hasLocalData() {
  try {
    return storage.getEquipList().length > 0 ||
      storage.getStringingList().length > 0 ||
      storage.getGripList().length > 0 ||
      storage.getExpenseList().length > 0
  } catch { return false }
}

export async function migrateIfNeeded() {
  if (isMigrated()) return false
  if (!hasLocalData()) {
    setMigrated()
    return false
  }

  await ensureSession()

  const localEquip = storage.getEquipList()
  for (const item of localEquip) {
    const { id, ...data } = item
    await cloud.add('equipment', data, String(id))
  }

  const localStringing = storage.getStringingList()
  for (const item of localStringing) {
    const { id, equipId, ...data } = item
    await cloud.add('stringing', { ...data, equipment_id: String(equipId) }, String(id))
  }

  const localGrip = storage.getGripList()
  for (const item of localGrip) {
    const { id, equipId, ...data } = item
    await cloud.add('grip', { ...data, equipment_id: String(equipId) }, String(id))
  }

  const localExpense = storage.getExpenseList()
  for (const item of localExpense) {
    const { id, equipId, stringingId, gripId, ...data } = item
    await cloud.add('expenses', {
      ...data,
      equipment_id: equipId ? String(equipId) : undefined,
      stringing_id: stringingId ? String(stringingId) : undefined,
      grip_id: gripId ? String(gripId) : undefined,
    }, String(id))
  }

  try {
    const raw = uni.getStorageSync('userProfile')
    if (raw) {
      const profile = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (profile.nickname || profile.gender) {
        await cloud.add('profile', profile)
      }
    }
  } catch (e) {
    // ignore profile migration failure
  }

  setMigrated()
  clearLocalData()
  return true
}

function clearLocalData() {
  uni.removeStorageSync('equipList')
  uni.removeStorageSync('stringingList')
  uni.removeStorageSync('gripList')
  uni.removeStorageSync('expenseList')
}
