const STORAGE_KEY = 'equipList'

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
