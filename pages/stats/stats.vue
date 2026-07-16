<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useExpenseStore } from '@/stores/expense'
import { useEquipmentStore } from '@/stores/equipment'
import { useStringingStore } from '@/stores/stringing'
import { useGripStore } from '@/stores/grip'

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
  return [
    { key: 'equipment', label: '🛒 购买', amount: raw.equipment || 0 },
    { key: 'stringing', label: '🪡 穿线', amount: raw.stringing || 0 },
    { key: 'grip', label: '✋ 手胶', amount: raw.grip || 0 },
    { key: 'manual', label: '📝 手动', amount: raw.manual || 0 },
  ].filter(c => c.amount > 0)
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
  uni.navigateTo({ url: `/pages/equip-detail/equip-detail?id=${id}` })
}

onShow(() => {
  expenseStore.load()
  equipStore.load()
  stringingStore.load()
  gripStore.load()
  if (equipStore.list.length > 0) {
    expenseStore.migrateFromEquipment(equipStore.list)
  }
})
</script>

<template>
  <view class="page">
    <view class="page-header">
      <text class="page-title">费用概览</text>
    </view>

    <scroll-view scroll-y class="page-body">
      <!-- Summary Cards -->
      <view class="summary-grid">
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
      </view>

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
            <text class="category-label">{{ cat.label }}</text>
            <text class="category-amount">¥{{ cat.amount }}</text>
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
    </scroll-view>
  </view>
</template>

<style scoped>
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

/* Category List */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #1a1f2a;
  border-radius: 12rpx;
  padding: 24rpx 20rpx;
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
