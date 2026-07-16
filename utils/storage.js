const STORAGE_KEY = 'equipList'
const STRINGING_KEY = 'stringingList'
const GRIP_KEY = 'gripList'
const EXPENSE_KEY = 'expenseList'

export function getEquipList() {
  try {
    const data = uni.getStorageSync(STORAGE_KEY)
    return data || []
  } catch (e) {
    return []
  }
}

export function saveEquipList(list) {
  uni.setStorageSync(STORAGE_KEY, list)
}

export function addEquip(equip) {
  const list = getEquipList()
  list.unshift(equip)
  saveEquipList(list)
  return list
}

export function updateEquip(id, data) {
  const list = getEquipList()
  const index = list.findIndex(item => item.id === id)
  if (index !== -1) {
    list[index] = { ...list[index], ...data }
    saveEquipList(list)
  }
  return list
}

export function deleteEquip(id) {
  const list = getEquipList()
  const newList = list.filter(item => item.id !== id)
  saveEquipList(newList)
  return newList
}

export function getEquipById(id) {
  const list = getEquipList()
  return list.find(item => item.id === id) || null
}

// ---- Stringing Records ----

export function getStringingList() {
  try {
    const data = uni.getStorageSync(STRINGING_KEY)
    return data || []
  } catch (e) {
    return []
  }
}

export function saveStringingList(list) {
  uni.setStorageSync(STRINGING_KEY, list)
}

export function addStringing(record) {
  const list = getStringingList()
  list.unshift(record)
  saveStringingList(list)
  return list
}

export function updateStringing(id, data) {
  const list = getStringingList()
  const index = list.findIndex(item => item.id === id)
  if (index !== -1) {
    list[index] = { ...list[index], ...data }
    saveStringingList(list)
  }
  return list
}

export function deleteStringing(id) {
  const list = getStringingList()
  const newList = list.filter(item => item.id !== id)
  saveStringingList(newList)
  return newList
}

export function getStringingByEquipId(equipId) {
  const list = getStringingList()
  return list.filter(item => item.equipId === equipId)
}

// ---- Grip Records ----

export function getGripList() {
  try {
    const data = uni.getStorageSync(GRIP_KEY)
    return data || []
  } catch (e) {
    return []
  }
}

export function saveGripList(list) {
  uni.setStorageSync(GRIP_KEY, list)
}

export function addGrip(record) {
  const list = getGripList()
  list.unshift(record)
  saveGripList(list)
  return list
}

export function updateGrip(id, data) {
  const list = getGripList()
  const index = list.findIndex(item => item.id === id)
  if (index !== -1) {
    list[index] = { ...list[index], ...data }
    saveGripList(list)
  }
  return list
}

export function deleteGrip(id) {
  const list = getGripList()
  const newList = list.filter(item => item.id !== id)
  saveGripList(newList)
  return newList
}

export function getGripByEquipId(equipId) {
  const list = getGripList()
  return list.filter(item => item.equipId === equipId)
}

// ---- Expense Records ----

export function getExpenseList() {
  try {
    const data = uni.getStorageSync(EXPENSE_KEY)
    return data || []
  } catch (e) {
    return []
  }
}

export function saveExpenseList(list) {
  uni.setStorageSync(EXPENSE_KEY, list)
}

export function addExpense(record) {
  const list = getExpenseList()
  list.unshift(record)
  saveExpenseList(list)
  return list
}

export function updateExpense(id, data) {
  const list = getExpenseList()
  const index = list.findIndex(item => item.id === id)
  if (index !== -1) {
    list[index] = { ...list[index], ...data }
    saveExpenseList(list)
  }
  return list
}

export function deleteExpense(id) {
  const list = getExpenseList()
  const newList = list.filter(item => item.id !== id)
  saveExpenseList(newList)
  return newList
}

export function getExpensesByEquipId(equipId) {
  const list = getExpenseList()
  return list.filter(item => item.equipId === equipId)
}
