<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useExpenseStore } from '@/stores/expense'
import { useEquipmentStore } from '@/stores/equipment'
import { useStringingStore } from '@/stores/stringing'
import { useGripStore } from '@/stores/grip'
import { EQUIP_TYPE_ICONS } from '@/utils/equipment-data'

const userStore = useUserStore()
const expenseStore = useExpenseStore()
const equipStore = useEquipmentStore()
const stringingStore = useStringingStore()
const gripStore = useGripStore()

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1

const totalAll = computed(() => expenseStore.totalAll)
const totalThisYear = computed(() => expenseStore.totalByYear(currentYear))
const totalThisMonth = computed(() => expenseStore.totalByMonth(currentYear, currentMonth))

const categorySummary = computed(() => {
  const raw = expenseStore.categorySummary
  const items = [
    { key: 'equipment', label: '🛒 购买', amount: raw.equipment || 0 },
    { key: 'stringing', label: '🪡 穿线', amount: raw.stringing || 0 },
    { key: 'grip', label: '✋ 手胶', amount: raw.grip || 0 },
    { key: 'manual', label: '📝 手动', amount: raw.manual || 0 },
  ].filter(c => c.amount > 0)
  const total = items.reduce((s, c) => s + c.amount, 0) || 1
  return items.map(c => ({ ...c, percent: Math.round((c.amount / total) * 100) }))
})

const totalSpentOnEquipment = computed(() => {
  return equipStore.list.reduce((sum, item) => sum + (item.price || 0), 0)
})

const topExpensive = computed(() => {
  return [...equipStore.list]
    .filter(item => item.price)
    .sort((a, b) => (b.price || 0) - (a.price || 0))
    .slice(0, 5)
})

const monthlyAvg = computed(() => {
  const total = expenseStore.totalAll
  if (total === 0) return 0
  const months = new Set(
    expenseStore.list.filter(e => e.date).map(e => e.date.substring(0, 7))
  )
  return Math.round(total / (months.size || 1))
})

const TYPE_LABELS = { racket: '球拍', shoes: '球鞋', shuttle: '羽毛球', bag: '球包', other: '其他' }

const equipTypeSummary = computed(() => {
  const count = {}
  equipStore.list.forEach(item => {
    count[item.type] = (count[item.type] || 0) + 1
  })
  const total = equipStore.list.length || 1
  return Object.entries(count)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, cnt]) => ({
      type,
      label: TYPE_LABELS[type] || type,
      count: cnt,
      percent: Math.round((cnt / total) * 100)
    }))
})

const avgStringingTension = computed(() => {
  const records = stringingStore.list
  if (records.length === 0) return null
  const validH = records.filter(r => r.tensionH)
  const validV = records.filter(r => r.tensionV)
  const avgH = validH.length
    ? validH.reduce((s, r) => s + r.tensionH, 0) / validH.length
    : null
  const avgV = validV.length
    ? validV.reduce((s, r) => s + r.tensionV, 0) / validV.length
    : null
  if (avgH === null && avgV === null) return null
  return { h: avgH, v: avgV }
})

const topStringBrand = computed(() => {
  const records = stringingStore.list.filter(r => r.stringBrand)
  if (records.length === 0) return null
  const count = {}
  records.forEach(r => {
    count[r.stringBrand] = (count[r.stringBrand] || 0) + 1
  })
  return Object.entries(count).sort((a, b) => b[1] - a[1])[0]
})

const stringingFrequency = computed(() => {
  const records = [...stringingStore.list]
    .filter(r => r.date)
    .sort((a, b) => a.date.localeCompare(b.date))
  if (records.length < 2) return null
  let totalDays = 0
  for (let i = 1; i < records.length; i++) {
    const d1 = new Date(records[i - 1].date)
    const d2 = new Date(records[i].date)
    totalDays += (d2 - d1) / 86400000
  }
  return Math.round(totalDays / (records.length - 1))
})

const monthlyData = computed(() => expenseStore.monthlySummary)

const maxMonthly = computed(() => {
  if (monthlyData.value.length === 0) return 1
  return Math.max(...monthlyData.value.map(m => m.total), 1)
})

const equipCount = computed(() => equipStore.list.length)
const stringingCount = computed(() => stringingStore.list.length)
const gripCount = computed(() => gripStore.list.length)
const retiredCount = computed(() => equipStore.retiredList.length)

function goToEquipDetail(id) {
  uni.navigateTo({ url: `/pages-equip/equip-detail/equip-detail?id=${id}` })
}

onShow(async () => {
  await Promise.all([
    userStore.load(),
    expenseStore.load(),
    equipStore.load(),
    stringingStore.load(),
    gripStore.load(),
  ])
  if (equipStore.list.length > 0) {
    await expenseStore.migrateFromEquipment(equipStore.list)
  }
})
</script>

<template>
  <view class="page">
    <view class="page-header">
      <text class="page-title">      数据统计</text>
    </view>

    <scroll-view scroll-y class="page-body">
      <view v-if="!userStore.isVIP" class="vip-lock" @tap="uni.navigateTo({ url: '/pages/profile/vip' })">
        <text class="vip-lock-icon">🔒</text>
        <text class="vip-lock-title">完整版功能</text>
        <text class="vip-lock-desc">升级完整版即可查看消费统计、寿命进度等数据</text>
        <text class="vip-lock-btn">查看升级方案</text>
      </view>

      <!-- Summary Cards -->
      <view class="summary-grid" v-if="userStore.isVIP">
        <view class="summary-card total">
          <text class="summary-label">总支出</text>
          <text class="summary-value">¥{{ totalAll }}</text>
        </view>
        <view class="summary-card year">
          <text class="summary-label">{{ currentYear }}</text>
          <text class="summary-value">¥{{ totalThisYear }}</text>
        </view>
        <view class="summary-card month">
          <text class="summary-label">{{ currentYear }}/{{ currentMonth }}</text>
          <text class="summary-value">¥{{ totalThisMonth }}</text>
        </view>
        <view class="summary-card avg">
          <text class="summary-label">月均花费</text>
          <text class="summary-value">¥{{ monthlyAvg }}</text>
        </view>
      </view>

      <template v-if="userStore.isVIP">
      <!-- Quick Stats -->
      <view class="quick-stats">
        <view class="quick-stat-item">
          <text class="quick-stat-value">{{ equipCount }}</text>
          <text class="quick-stat-label">装备</text>
        </view>
        <view class="quick-stat-item">
          <text class="quick-stat-value">{{ stringingCount }}</text>
          <text class="quick-stat-label">穿线次数</text>
        </view>
        <view class="quick-stat-item">
          <text class="quick-stat-value">{{ gripCount }}</text>
          <text class="quick-stat-label">更换手胶</text>
        </view>
        <view class="quick-stat-item">
          <text class="quick-stat-value">{{ retiredCount }}</text>
          <text class="quick-stat-label">已淘汰</text>
        </view>
      </view>

      <!-- Equipment Type Distribution -->
      <view class="section">
        <text class="section-title">装备类型分布</text>
        <view class="type-distribution" v-if="equipTypeSummary.length > 0">
          <view
            v-for="item in equipTypeSummary"
            :key="item.type"
            class="type-dist-item"
          >
            <view class="type-dist-header">
              <view class="type-dist-left">
                <uni-icons fontFamily="iconfont" :size="24" color="#9ca3af">{{ EQUIP_TYPE_ICONS[item.type] }}</uni-icons>
                <text class="type-dist-label">{{ item.label }}</text>
              </view>
              <text class="type-dist-count">{{ item.count }} 件</text>
            </view>
            <view class="type-dist-bar-bg">
              <view
                class="type-dist-bar-fill"
                :style="{ width: item.percent + '%' }"
              ></view>
            </view>
          </view>
        </view>
        <view v-else class="empty-section">
          <text class="empty-section-text">暂无装备数据</text>
        </view>
      </view>

      <!-- Stringing Data -->
      <view v-if="stringingCount > 0" class="section">
        <text class="section-title">穿线数据</text>
        <view class="stringing-data-grid">
          <view v-if="avgStringingTension" class="stringing-data-card">
            <text class="stringing-data-value">{{ avgStringingTension.h !== null ? avgStringingTension.h.toFixed(1) : '-' }}/{{ avgStringingTension.v !== null ? avgStringingTension.v.toFixed(1) : '-' }}</text>
            <text class="stringing-data-label">平均磅数</text>
          </view>
          <view v-if="topStringBrand" class="stringing-data-card">
            <text class="stringing-data-value stringing-data-value-sm">{{ topStringBrand[0] }}</text>
            <text class="stringing-data-label">常用线品牌</text>
          </view>
          <view v-if="stringingFrequency" class="stringing-data-card">
            <text class="stringing-data-value">{{ stringingFrequency }}<text class="stringing-data-unit">天</text></text>
            <text class="stringing-data-label">平均穿线间隔</text>
          </view>
        </view>
      </view>

      <!-- Monthly Trend -->
      <view class="section">
        <text class="section-title">月度花费</text>
        <view class="monthly-chart" v-if="monthlyData.length > 0">
          <view
            v-for="(item, index) in monthlyData"
            :key="index"
            class="monthly-bar-wrap"
          >
            <view class="monthly-bar-bg">
              <view
                class="monthly-bar-fill"
                :style="{ height: (item.total / maxMonthly) * 100 + '%' }"
              ></view>
            </view>
            <text class="monthly-bar-label">{{ item.month.slice(5) }}</text>
            <text class="monthly-bar-value">¥{{ item.total }}</text>
          </view>
        </view>
        <view v-else class="empty-section">
          <text class="empty-section-text">暂无费用记录</text>
        </view>
      </view>

      <!-- Category Breakdown -->
      <view class="section">
        <text class="section-title">分类统计</text>
        <view class="category-list" v-if="categorySummary.length > 0">
          <view
            v-for="cat in categorySummary"
            :key="cat.key"
            class="category-item"
          >
            <view class="category-top">
              <text class="category-label">{{ cat.label }}</text>
              <text class="category-amount">¥{{ cat.amount }}</text>
            </view>
            <view class="category-bar-bg">
              <view
                class="category-bar-fill"
                :style="{ width: cat.percent + '%' }"
              ></view>
            </view>
            <text class="category-percent">{{ cat.percent }}%</text>
          </view>
        </view>
        <view v-else class="empty-section">
          <text class="empty-section-text">暂无分类数据</text>
        </view>
      </view>

      <!-- Most Expensive Equipment -->
      <view class="section">
        <text class="section-title">最贵装备排行</text>
        <view class="expense-list" v-if="topExpensive.length > 0">
          <view
            v-for="item in topExpensive"
            :key="item.id"
            class="expense-item"
            @tap="goToEquipDetail(item.id)"
          >
            <view class="expense-item-left">
              <text class="expense-item-name">{{ item.brand }} {{ item.model }}</text>
              <text class="expense-item-type">{{ item.type }}</text>
            </view>
            <text class="expense-item-amount">¥{{ item.price }}</text>
          </view>
        </view>
        <view v-else class="empty-section">
          <text class="empty-section-text">暂无价格记录</text>
        </view>
      </view>

      <view class="bottom-spacer"></view>
      </template>
    </scroll-view>
  </view>
</template>

<style scoped>
.vip-lock {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
  background: #1a1d27;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
}
.vip-lock:active {
  background: #1e2430;
}
.vip-lock-icon {
  font-size: 60rpx;
  margin-bottom: 20rpx;
}
.vip-lock-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12rpx;
}
.vip-lock-desc {
  font-size: 24rpx;
  color: #6b7280;
  text-align: center;
  margin-bottom: 24rpx;
  line-height: 1.5;
}
.vip-lock-btn {
  font-size: 26rpx;
  color: #C8FF1F;
  font-weight: 600;
  padding: 16rpx 48rpx;
  border: 1rpx solid #C8FF1F;
  border-radius: 40rpx;
}
.page {
  min-height: 100vh;
  background-color: #0f1117;
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: 40rpx 36rpx 20rpx;
}
.page-title {
  font-size: 42rpx;
  font-weight: 800;
  color: #ffffff;
}

.page-body {
  flex: 1;
  padding: 0 36rpx 40rpx;
  box-sizing: border-box;
  width: 100%;
}

/* Summary Grid */
.summary-grid {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}
.summary-card {
  flex: 1;
  background-color: #1a1f2a;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.summary-card.total {
  background: linear-gradient(135deg, #1a1f2a 0%, #2a2530 100%);
}
.summary-label {
  font-size: 22rpx;
  color: #6b7280;
}
.summary-value {
  font-size: 34rpx;
  font-weight: 800;
  color: #ffffff;
}
.summary-card.total .summary-value {
  color: #C8FF1F;
}

/* Quick Stats */
.quick-stats {
  display: flex;
  gap: 12rpx;
  margin-bottom: 36rpx;
}
.quick-stat-item {
  flex: 1;
  background-color: #1a1f2a;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}
.quick-stat-value {
  font-size: 32rpx;
  font-weight: 800;
  color: #ffffff;
}
.quick-stat-label {
  font-size: 20rpx;
  color: #6b7280;
}

/* Section */
.section {
  margin-bottom: 36rpx;
}
.section-title {
  font-size: 24rpx;
  font-weight: 700;
  color: #6b7280;
  letter-spacing: 1rpx;
  margin-bottom: 16rpx;
  display: block;
}

/* Monthly Chart */
.monthly-chart {
  display: flex;
  gap: 8rpx;
  align-items: flex-end;
  height: 200rpx;
  padding: 20rpx 0;
  background-color: #1a1f2a;
  border-radius: 16rpx;
  padding: 24rpx 16rpx;
}
.monthly-bar-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  height: 100%;
  justify-content: flex-end;
}
.monthly-bar-bg {
  width: 100%;
  max-width: 48rpx;
  height: 140rpx;
  background-color: #1e2430;
  border-radius: 8rpx;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.monthly-bar-fill {
  width: 100%;
  background-color: #C8FF1F;
  border-radius: 8rpx;
  min-height: 4rpx;
}
.monthly-bar-label {
  font-size: 18rpx;
  color: #4b5563;
}
.monthly-bar-value {
  font-size: 18rpx;
  color: #6b7280;
}

/* Equipment Type Distribution */
.type-distribution {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  background-color: #1a1f2a;
  border-radius: 16rpx;
  padding: 24rpx;
}
.type-dist-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.type-dist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.type-dist-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.type-dist-label {
  font-size: 26rpx;
  color: #e5e5e7;
}
.type-dist-count {
  font-size: 22rpx;
  color: #6b7280;
}
.type-dist-bar-bg {
  width: 100%;
  height: 8rpx;
  background-color: #1e2430;
  border-radius: 4rpx;
  overflow: hidden;
}
.type-dist-bar-fill {
  height: 100%;
  background-color: #C8FF1F;
  border-radius: 4rpx;
  transition: width 0.3s;
}

/* Stringing Data */
.stringing-data-grid {
  display: flex;
  gap: 16rpx;
}
.stringing-data-card {
  flex: 1;
  background-color: #1a1f2a;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  align-items: center;
}
.stringing-data-value {
  font-size: 32rpx;
  font-weight: 800;
  color: #C8FF1F;
}
.stringing-data-value-sm {
  font-size: 24rpx;
  word-break: break-all;
  text-align: center;
  line-height: 1.3;
}
.stringing-data-unit {
  font-size: 20rpx;
  color: #C8FF1F;
  font-weight: 400;
  margin-left: 4rpx;
}
.stringing-data-label {
  font-size: 20rpx;
  color: #6b7280;
}

/* Category List */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.category-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  background-color: #1a1f2a;
  border-radius: 12rpx;
  padding: 24rpx 20rpx;
}
.category-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.category-label {
  font-size: 26rpx;
  color: #ffffff;
}
.category-amount {
  font-size: 28rpx;
  font-weight: 700;
  color: #C8FF1F;
}
.category-bar-bg {
  width: 100%;
  height: 8rpx;
  background-color: #1e2430;
  border-radius: 4rpx;
  overflow: hidden;
}
.category-bar-fill {
  height: 100%;
  background-color: #C8FF1F;
  border-radius: 4rpx;
  transition: width 0.3s;
}
.category-percent {
  font-size: 20rpx;
  color: #6b7280;
  text-align: right;
}

/* Expense List */
.expense-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.expense-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #1a1f2a;
  border-radius: 12rpx;
  padding: 20rpx;
}
.expense-item:active {
  background-color: #222838;
}
.expense-item-left {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  flex: 1;
  min-width: 0;
}
.expense-item-name {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.expense-item-type {
  font-size: 20rpx;
  color: #6b7280;
}
.expense-item-amount {
  font-size: 28rpx;
  font-weight: 700;
  color: #ffffff;
  flex-shrink: 0;
}

.empty-section {
  padding: 40rpx 0;
  display: flex;
  justify-content: center;
}
.empty-section-text {
  font-size: 26rpx;
  color: #4b5563;
}

.bottom-spacer {
  height: 60rpx;
}
</style>
