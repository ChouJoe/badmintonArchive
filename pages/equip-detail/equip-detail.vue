<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useEquipmentStore } from '@/stores/equipment'
import { useStringingStore } from '@/stores/stringing'
import { useGripStore } from '@/stores/grip'
import { useExpenseStore } from '@/stores/expense'
import { getModelImageUrl, getBrandLogo, EQUIP_TYPE_ICONS } from '@/utils/equipment-data'

const store = useEquipmentStore()
const stringingStore = useStringingStore()
const gripStore = useGripStore()
const expenseStore = useExpenseStore()
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 40

function getHeaderRight() {
  try {
    const menu = uni.getMenuButtonBoundingClientRect()
    const sw = uni.getSystemInfoSync().screenWidth
    return sw - menu.left + 10
  } catch (e) {
    return 88
  }
}
const headerRightPx = getHeaderRight()

const equipId = ref(null)
const equip = computed(() => store.getEquipById(equipId.value))
const heroImgError = ref(false)
const showStringingForm = ref(false)
const showGripForm = ref(false)
const editGripId = ref(null)

const stringingForm = ref({
  tensionH: '',
  tensionV: '',
  stringBrand: '',
  stringThickness: '',
  shop: '',
  price: '',
  note: '',
  date: ''
})

const gripForm = ref({
  price: '',
  note: '',
  date: ''
})

onLoad((query) => {
  if (query.id) {
    equipId.value = Number(query.id)
  }
  store.load()
  stringingStore.load()
  gripStore.load()
  expenseStore.load()
})

const cardImage = computed(() => {
  if (!equip.value) return null
  return getModelImageUrl(equip.value.brand, equip.value.model) || getBrandLogo(equip.value.brand)
})

const stringingRecords = computed(() => {
  return stringingStore.getByEquipId(equipId.value)
})

const stringingCount = computed(() => {
  return stringingStore.countByEquipId(equipId.value)
})

const stringingCost = computed(() => {
  return stringingStore.totalCostByEquipId(equipId.value)
})

const gripRecords = computed(() => {
  return gripStore.getByEquipId(equipId.value)
})

const gripCount = computed(() => {
  return gripStore.countByEquipId(equipId.value)
})

const gripCost = computed(() => {
  return gripStore.totalCostByEquipId(equipId.value)
})

const equipExpenses = computed(() => {
  return expenseStore.getByEquipId(equipId.value)
})

const totalSpent = computed(() => {
  const purchasePrice = equip.value?.price || 0
  const stringing = stringingCost.value
  const grip = gripCost.value
  return purchasePrice + stringing + grip
})

const today = new Date().toISOString().split('T')[0]

const daysInUse = computed(() => {
  if (!equip.value?.buyDate) return null
  const buy = new Date(equip.value.buyDate)
  const now = new Date()
  const diff = now - buy
  if (diff < 0) return 0
  return Math.floor(diff / 86400000)
})

function goEdit() {
  uni.navigateTo({ url: `/pages/equip-form/equip-form?id=${equipId.value}` })
}

function handleDelete() {
  uni.showModal({
    title: '确认删除',
    content: '确认删除这件装备记录吗？此操作不可恢复。',
    success: (res) => {
      if (res.confirm) {
        stringingStore.removeByEquipId(equipId.value)
        gripStore.removeByEquipId(equipId.value)
        expenseStore.removeByEquipId(equipId.value)
        store.remove(equipId.value)
        uni.showToast({ title: '删除成功', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 300)
      }
    }
  })
}

const editStringingId = ref(null)

function toggleStringingForm() {
  showStringingForm.value = !showStringingForm.value
  editStringingId.value = null
  if (showStringingForm.value) {
    stringingForm.value = {
      tensionH: '',
      tensionV: '',
      stringBrand: '',
      stringThickness: '',
      shop: '',
      price: '',
      note: '',
      date: today
    }
  }
}

function editStringing(record) {
  showStringingForm.value = true
  editStringingId.value = record.id
  stringingForm.value = {
    tensionH: String(record.tensionH || ''),
    tensionV: String(record.tensionV || ''),
    stringBrand: record.stringBrand || '',
    stringThickness: record.stringThickness || '',
    shop: record.shop || '',
    price: record.price ? String(record.price) : '',
    note: record.note || '',
    date: record.date || today
  }
}

function saveStringing() {
  if (!stringingForm.value.tensionH && !stringingForm.value.tensionV) {
    uni.showToast({ title: '请填写磅数', icon: 'none' })
    return
  }

  const record = {
    equipId: equipId.value,
    tensionH: stringingForm.value.tensionH ? Number(stringingForm.value.tensionH) : null,
    tensionV: stringingForm.value.tensionV ? Number(stringingForm.value.tensionV) : null,
    stringBrand: stringingForm.value.stringBrand.trim() || null,
    stringThickness: stringingForm.value.stringThickness.trim() || null,
    shop: stringingForm.value.shop.trim() || null,
    price: stringingForm.value.price ? Number(stringingForm.value.price) : null,
    note: stringingForm.value.note.trim() || null,
    date: stringingForm.value.date || today
  }

  if (editStringingId.value) {
    record.id = editStringingId.value
    stringingStore.update(editStringingId.value, record)

    const related = expenseStore.list.find(
      item => item.stringingId === editStringingId.value && item.category === 'stringing'
    )
    if (related) {
      expenseStore.update(related.id, {
        amount: record.price || 0,
        date: record.date,
        note: `穿线 ${record.tensionH || '-'}/${record.tensionV || '-'} ${equip.value?.brand || ''}`
      })
    }

    uni.showToast({ title: '更新成功', icon: 'success' })
  } else {
    record.id = Date.now()
    stringingStore.add(record)

    if (record.price) {
      expenseStore.add({
        id: Date.now() + 1,
        date: record.date,
        amount: record.price,
        category: 'stringing',
        equipId: equipId.value,
        stringingId: record.id,
        note: `穿线 ${record.tensionH || '-'}/${record.tensionV || '-'} ${equip.value?.brand || ''}`
      })
    }

    uni.showToast({ title: '添加成功', icon: 'success' })
  }

  editStringingId.value = null
  showStringingForm.value = false
}

function toggleGripForm() {
  showGripForm.value = !showGripForm.value
  editGripId.value = null
  if (showGripForm.value) {
    gripForm.value = {
      price: '',
      note: '',
      date: today
    }
  }
}

function editGrip(record) {
  showGripForm.value = true
  editGripId.value = record.id
  gripForm.value = {
    price: record.price ? String(record.price) : '',
    note: record.note || '',
    date: record.date || today
  }
}

function saveGrip() {
  const record = {
    equipId: equipId.value,
    price: gripForm.value.price ? Number(gripForm.value.price) : null,
    note: gripForm.value.note.trim() || null,
    date: gripForm.value.date || today
  }

  if (editGripId.value) {
    record.id = editGripId.value
    gripStore.update(editGripId.value, record)

    const related = expenseStore.list.find(
      item => item.gripId === editGripId.value && item.category === 'grip'
    )
    if (related) {
      expenseStore.update(related.id, {
        amount: record.price || 0,
        date: record.date,
        note: `更换手胶`
      })
    }

    uni.showToast({ title: '更新成功', icon: 'success' })
  } else {
    record.id = Date.now()
    gripStore.add(record)

    if (record.price) {
      expenseStore.add({
        id: Date.now() + 1,
        date: record.date,
        amount: record.price,
        category: 'grip',
        equipId: equipId.value,
        gripId: record.id,
        note: `更换手胶`
      })
    }

    uni.showToast({ title: '添加成功', icon: 'success' })
  }

  editGripId.value = null
  showGripForm.value = false
}

function deleteGrip(id, e) {
  if (e) e.stopPropagation()
  uni.showModal({
    title: '确认删除',
    content: '删除此手胶更换记录？',
    success: (res) => {
      if (res.confirm) {
        const related = expenseStore.list.find(
          item => item.gripId === id && item.category === 'grip'
        )
        if (related) expenseStore.remove(related.id)
        gripStore.remove(id)
      }
    }
  })
}

function deleteStringing(id, e) {
  if (e) e.stopPropagation()
  uni.showModal({
    title: '确认删除',
    content: '删除此穿线记录？',
    success: (res) => {
      if (res.confirm) {
        const related = expenseStore.list.find(
          item => item.stringingId === id && item.category === 'stringing'
        )
        if (related) expenseStore.remove(related.id)
        stringingStore.remove(id)
      }
    }
  })
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

function onStringingFormInput(field, e) {
  stringingForm.value[field] = e.detail.value
}
</script>

<template>
  <view class="page" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="page-header" >
      <navigator class="header-left" open-type="navigateBack" hover-class="header-left-hover">
        <image class="back-icon" src="/static/icons/back.svg" mode="aspectFit" />
      </navigator>
      <text class="page-title">装备详情</text>
      <view class="header-right">
        <image class="header-icon" src="/static/icons/edit.svg" mode="aspectFit" @tap="goEdit" />
        <image class="header-icon" src="/static/icons/delete.svg" mode="aspectFit" @tap="handleDelete" />
      </view>
    </view>

    <scroll-view scroll-y class="page-body" v-if="equip">
      <view class="equip-hero">
        <image
          class="equip-hero-img"
          :src="cardImage"
          mode="aspectFill"
          @error="heroImgError = true"
        />
        <view class="equip-hero-overlay"></view>
        <view class="equip-hero-content">
          <view class="equip-hero-titles">
            <view  class="equip-hero-type">
              <uni-icons fontFamily="iconfont" :size="26" color="#ffffffa1" >{{ EQUIP_TYPE_ICONS[equip.type] }}</uni-icons>
              <text class="equip-title-brand">{{ equip.brand }}</text>
            </view>
            <text class="equip-title-model">{{ equip.model }}</text>
          </view>
          
        </view>
      </view>

      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">{{ daysInUse !== null ? daysInUse : '—' }}</text>
          <text class="stat-label">使用天数</text>
        </view>
        <view v-if="equip.type === 'racket'" class="stat-item">
          <text class="stat-value">{{ stringingCount }}</text>
          <text class="stat-label">穿线次数</text>
        </view>
        <view v-if="equip.type === 'racket'" class="stat-item">
          <text class="stat-value">{{ gripCount }}</text>
          <text class="stat-label">更换手胶</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">¥{{ totalSpent }}</text>
          <text class="stat-label">总花费</text>
        </view>
      </view>

      <view class="section">
          <view class="section-header">        
            <text class="section-title">详细信息</text>
          </view>

        <view class="detail-grid">
          <view class="detail-item">
            <text class="detail-label">购买价格</text>
            <text class="detail-value">{{ equip.price ? `¥${equip.price}` : '—' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">购买日期</text>
            <text class="detail-value">{{ equip.buyDate || '—' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">自评评分</text>
            <text class="detail-value">{{ equip.rating }}/10</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">状态</text>
            <text
              class="detail-value status-badge"
              :class="{ retired: equip.retired }"
            >{{ equip.retired ? '已淘汰' : '使用中' }}</text>
          </view>
          <view class="detail-item" v-if="equip.tag">
            <text class="detail-label">标签</text>
            <text class="detail-value">{{ equip.tag }}</text>
          </view>
        </view>
        <view class="detail-note" v-if="equip.note">
          <text class="detail-label">备注</text>
          <text class="detail-note-text">{{ equip.note }}</text>
        </view>
      </view>

      <view v-if="equip.type === 'racket'" class="section">
        <view class="section-header">
          <text class="section-title">穿线记录 ({{ stringingCount }})</text>
          <view class="section-header-actions">
            <view v-if="showStringingForm" class="save-stringing-btn" @tap="saveStringing">
              <text class="save-stringing-text">保存</text>
            </view>
            <view class="add-stringing-btn" @tap="toggleStringingForm">
              <text v-if="!showStringingForm" class="add-stringing-icon">+</text>
              <text class="add-stringing-text">{{ showStringingForm ? '取消' : '添加' }}</text>
            </view>
          </view>
        </view>

        <view v-if="showStringingForm" class="stringing-form">
          <view class="stringing-form-row">
            <view class="stringing-form-field">
              <text class="stringing-form-label">横磅数 (lbs)</text>
              <input
                class="stringing-form-input"
                :value="stringingForm.tensionH"
                @input="e => onStringingFormInput('tensionH', e)"
                type="digit"
                placeholder="例如 27"
                placeholder-class="input-ph"
              />
            </view>
            <view class="stringing-form-field">
              <text class="stringing-form-label">竖磅数 (lbs)</text>
              <input
                class="stringing-form-input"
                :value="stringingForm.tensionV"
                @input="e => onStringingFormInput('tensionV', e)"
                type="digit"
                placeholder="例如 26"
                placeholder-class="input-ph"
              />
            </view>
          </view>
          <view class="stringing-form-row">
            <view class="stringing-form-field">
              <text class="stringing-form-label">线品牌</text>
              <input
                class="stringing-form-input"
                :value="stringingForm.stringBrand"
                @input="e => onStringingFormInput('stringBrand', e)"
                placeholder="例如 Yonex BG65"
                placeholder-class="input-ph"
              />
            </view>
            <view class="stringing-form-field">
              <text class="stringing-form-label">线径</text>
              <input
                class="stringing-form-input"
                :value="stringingForm.stringThickness"
                @input="e => onStringingFormInput('stringThickness', e)"
                placeholder="例如 0.70mm"
                placeholder-class="input-ph"
              />
            </view>
          </view>
          <view class="stringing-form-row">
            <view class="stringing-form-field">
              <text class="stringing-form-label">穿线店</text>
              <input
                class="stringing-form-input"
                :value="stringingForm.shop"
                @input="e => onStringingFormInput('shop', e)"
                placeholder="穿线店铺名称"
                placeholder-class="input-ph"
              />
            </view>
            <view class="stringing-form-field">
              <text class="stringing-form-label">价格 (¥)</text>
              <input
                class="stringing-form-input"
                :value="stringingForm.price"
                @input="e => onStringingFormInput('price', e)"
                type="digit"
                placeholder="0"
                placeholder-class="input-ph"
              />
            </view>
          </view>
          <view class="stringing-form-field">
            <text class="stringing-form-label">日期</text>
            <picker mode="date" :value="stringingForm.date" @change="e => stringingForm.date = e.detail.value">
              <view class="stringing-date-trigger">
                <text class="stringing-date-text">{{ stringingForm.date || '选择日期' }}</text>
                <text class="stringing-date-icon">📅</text>
              </view>
            </picker>
          </view>
          <view class="stringing-form-field">
            <text class="stringing-form-label">备注</text>
            <input
              class="stringing-form-input"
              :value="stringingForm.note"
              @input="e => onStringingFormInput('note', e)"
              placeholder="可选备注"
              placeholder-class="input-ph"
            />
          </view>
        </view>

        <view v-if="stringingRecords.length === 0 && !showStringingForm" class="empty-section">
          <text class="empty-section-text">暂无穿线记录</text>
        </view>
        <view v-else class="stringing-list">
          <view
            v-for="record in stringingRecords"
            :key="record.id"
            class="stringing-item"
          >
            <view class="stringing-item-top">
              <view class="stringing-tension">
                <text class="stringing-tension-value">
                  {{ record.tensionH || '-' }}/{{ record.tensionV || '-' }}
                </text>
                <text class="stringing-tension-unit">lbs</text>
              </view>
              <view class="stringing-item-actions">
                <image class="stringing-item-action-icon" src="/static/icons/edit.svg" mode="aspectFit" @tap="editStringing(record)" />
                <image class="stringing-item-action-icon" src="/static/icons/delete.svg" mode="aspectFit" @tap="deleteStringing(record.id, $event)" />
              </view>
            </view>
            <view class="stringing-item-info">
              <text class="stringing-item-detail" v-if="record.stringBrand">
                {{ record.stringBrand }}{{ record.stringThickness ? ` (${record.stringThickness})` : '' }}
              </text>
              <text class="stringing-item-detail">{{ formatDate(record.date) }}</text>
              <text class="stringing-item-detail" v-if="record.shop">{{ record.shop }}</text>
              <text class="stringing-item-detail" v-if="record.price">¥{{ record.price }}</text>
            </view>
            <text class="stringing-item-note" v-if="record.note">{{ record.note }}</text>
          </view>
        </view>
      </view>

      <!-- GRIP -->
      <view v-if="equip.type === 'racket'" class="section">
        <view class="section-header">
          <text class="section-title">更换手胶 ({{ gripCount }})</text>
          <view class="section-header-actions">
            <view v-if="showGripForm" class="save-stringing-btn" @tap="saveGrip">
              <text class="save-stringing-text">保存</text>
            </view>
            <view class="add-stringing-btn" @tap="toggleGripForm">
              <text v-if="!showGripForm" class="add-stringing-icon">+</text>
              <text class="add-stringing-text">{{ showGripForm ? '取消' : '添加' }}</text>
            </view>
          </view>
        </view>

        <view v-if="showGripForm" class="stringing-form">
          <view class="stringing-form-field">
            <text class="stringing-form-label">价格 (¥)</text>
            <input
              class="stringing-form-input"
              :value="gripForm.price"
              @input="e => gripForm.price = e.detail.value"
              type="digit"
              placeholder="0"
              placeholder-class="input-ph"
            />
          </view>
          <view class="stringing-form-field">
            <text class="stringing-form-label">日期</text>
            <picker mode="date" :value="gripForm.date" @change="e => gripForm.date = e.detail.value">
              <view class="stringing-date-trigger">
                <text class="stringing-date-text">{{ gripForm.date || '选择日期' }}</text>
                <text class="stringing-date-icon">📅</text>
              </view>
            </picker>
          </view>
          <view class="stringing-form-field">
            <text class="stringing-form-label">备注</text>
            <input
              class="stringing-form-input"
              :value="gripForm.note"
              @input="e => gripForm.note = e.detail.value"
              placeholder="可选备注"
              placeholder-class="input-ph"
            />
          </view>
        </view>

        <view v-if="gripRecords.length === 0 && !showGripForm" class="empty-section">
          <text class="empty-section-text">暂无手胶记录</text>
        </view>
        <view v-else class="stringing-list">
          <view
            v-for="record in gripRecords"
            :key="record.id"
            class="stringing-item"
          >
            <view class="stringing-item-top">
              <view class="stringing-item-info">
                <text class="stringing-item-detail">{{ formatDate(record.date) }}</text>
                <text class="stringing-item-detail" v-if="record.price">¥{{ record.price }}</text>
              </view>
              <view class="stringing-item-actions">
                <image class="stringing-item-action-icon" src="/static/icons/edit.svg" mode="aspectFit" @tap="editGrip(record)" />
                <image class="stringing-item-action-icon" src="/static/icons/delete.svg" mode="aspectFit" @tap="deleteGrip(record.id, $event)" />
              </view>
            </view>
            <text class="stringing-item-note" v-if="record.note">{{ record.note }}</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">相关费用</text>
        </view>
        <view v-if="equipExpenses.length === 0" class="empty-section">
          <text class="empty-section-text">暂无费用记录</text>
        </view>
        <view v-else class="expense-list">
          <view
            v-for="exp in equipExpenses"
            :key="exp.id"
            class="expense-item"
          >
            <view class="expense-item-top">
              <text class="expense-item-category">
                {{ exp.category === 'stringing' ? '穿线费用' : exp.category === 'grip' ? '手胶费用' : '购买费用' }}
              </text>
              <text class="expense-item-amount">¥{{ exp.amount }}</text>
            </view>
            <view class="expense-item-bottom">
              <text class="expense-item-date">{{ exp.date }}</text>
              <text class="expense-item-note" v-if="exp.note"> • {{ exp.note }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>
  </view>
</template>

<style scoped>
.page {
  height: 100vh;
  background-color: #0f1117;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 80rpx 20rpx 30rpx 20rpx;
  flex-shrink: 0;
}
.header-left {
  display: flex;
  align-items: center;
  padding: 8rpx;
  flex-shrink: 0;
}
.back-icon {
  width: 40rpx;
  height: 40rpx;
  display: block;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-shrink: 0;
}
.header-icon {
  width: 40rpx;
  height: 40rpx;
  display: block;
}
.header-left-hover {
  opacity: 0.5;
}
.page-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
}

.page-body {
  flex: 1;
  box-sizing: border-box;
  width: 100%;
}

.equip-hero {
  position: relative;
  height: 360rpx;
  overflow: hidden;
}
.equip-hero-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.equip-hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%);
}
.equip-hero-content {
  position: relative;
  z-index: 1;
  padding: 40rpx 36rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  box-sizing: border-box;
}
.equip-hero-type {
  display: flex;
  align-items: center;
  gap:12rpx;
  font-size: 24rpx;
  color: #C8FF1F;
  font-weight: 600;
}
.equip-hero-titles {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  align-self: flex-start;
}
.equip-title-brand {
  font-size: 28rpx;
  color: #ffffffa1;
}
.equip-title-model {
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffffa1;
}

.stats-row {
  display: flex;
  margin: 24rpx 36rpx 0;
  background-color: #171c27;
  border-radius: 16rpx;
  padding: 24rpx 0;
}
.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}
.stat-value {
  font-size: 36rpx;
  font-weight: 800;
  color: #C8FF1F;
}
.stat-label {
  font-size: 22rpx;
  color: #475569;
}

.section {
  margin: 36rpx 36rpx 0;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}
.section-title {
  font-size: 24rpx;
  font-weight: 700;
  color: #475569;
  letter-spacing: 1rpx;
}

.section-header-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.add-stringing-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  border: 1rpx solid #C8FF1F;
  color: #C8FF1F;
  padding: 4rpx 20rpx;
  border-radius: 24rpx;
}
.add-stringing-icon {
  font-size: 24rpx;
  color: #C8FF1F;
  font-weight: 600;
}
.add-stringing-text {
  font-size: 20rpx;
  font-weight: 600;
}
.save-stringing-btn {
  background-color: #C8FF1F;
  border-radius: 24rpx;
  padding: 4rpx 20rpx;
  display: flex;
}
.save-stringing-text {
  font-size: 20rpx;
  font-weight: 700;
  color: #0a0e14;
}

.detail-grid {
  display: flex;
  flex-wrap: wrap;
  gap:28rpx 10rpx;
  background-color: #171c27;
  border-radius: 16rpx;
  padding: 24rpx;
}
.detail-item {
  width: calc(50% - 8rpx);
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.detail-label {
  font-size: 22rpx;
  color: #475569;
}
.detail-value {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 600;
}
.status-badge {
  font-size: 20rpx;
  color: #4ade80;
  background-color: #4ade8050;
  border-radius: 8rpx;
  padding: 4rpx 12rpx;
  display: inline-block;
  align-self: flex-start;
}
.status-badge.retired {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.15);
}
.detail-note {
  background-color: #171c27;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-top: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.detail-note-text {
  font-size: 26rpx;
  color: #5a6478;
  line-height: 1.5;
}

.stringing-form {
  background-color: #171c27;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.stringing-form-row {
  display: flex;
  gap: 16rpx;
}
.stringing-form-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.stringing-form-label {
  font-size: 20rpx;
  color: #475569;
}
.stringing-form-input {
  background-color: #1e2430;
  border: 1rpx solid #2a3040;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 26rpx;
  color: #ffffff;
  box-sizing: border-box;
  width: 100%;
  height: 60rpx;
}
.input-ph {
  color: #4b5563;
}
.stringing-date-trigger {
  background-color: #1e2430;
  border: 1rpx solid #2a3040;
  border-radius: 12rpx;
  padding: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.stringing-date-text {
  font-size: 26rpx;
  color: #ffffff;
}
.stringing-date-icon {
  font-size: 24rpx;
}
.stringing-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.stringing-item {
  background-color: #171c27;
  border-radius: 16rpx;
  padding: 24rpx;
}
.stringing-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}
.stringing-tension {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}
.stringing-tension-value {
  font-size: 36rpx;
  font-weight: 800;
  color: #C8FF1F;
}
.stringing-tension-unit {
  font-size: 22rpx;
  color: #475569;
}
.stringing-item-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.stringing-item-action-icon {
  width: 32rpx;
  height: 32rpx;
  display: block;
}
.stringing-item-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.stringing-item-detail {
  font-size: 22rpx;
  line-height: 32rpx;
  color: #5a6478;
}
.stringing-item-note {
  font-size: 22rpx;
  color: #475569;
  margin-top: 8rpx;
  display: block;
}

.empty-section {
  padding: 60rpx 24rpx;
  display: flex;
  justify-content: center;
  background-color: #171c27;
  border-radius: 16rpx;
}
.empty-section-text {
  font-size: 26rpx;
  color: #475569;
}

.expense-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.expense-item {
  background-color: #171c27;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.expense-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.expense-item-bottom {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.expense-item-category {
  font-size: 24rpx;
  font-weight: 600;
  color: #ffffff;
}
.expense-item-date {
  font-size: 22rpx;
  color: #414a5b;
}
.expense-item-note {
  font-size: 22rpx;
  color: #414a5b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.expense-item-amount {
  font-size: 30rpx;
  font-weight: 700;
  color: #C8FF1F;
  flex-shrink: 0;
}

.bottom-spacer {
  height: 120rpx;
}
</style>
