<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getEquipList } from '@/utils/storage'
import { getModelImageUrl, getBrandLogo } from '@/utils/equipment-data'
import EquipEmpty from './equip-empty.vue'
import EquipAdd from '@/pages/equip-add/equip-add.vue'

const equipList = ref([])
const equipAddRef = ref(null)

const activeType = ref('all')
const activeStatus = ref('inuse')

const typeLabels = {
  racket: '球拍',
  shoes: '球鞋',
  bag: '球包',
  shuttle: '羽毛球',
  other: '其他'
}

const typeFilterOptions = [
  { key: 'all', label: 'All' },
  { key: 'racket', label: 'Racket' },
  { key: 'shoes', label: 'Shoes' },
  { key: 'shuttle', label: 'Shuttle' },
  { key: 'bag', label: 'Bag' },
  { key: 'other', label: 'Other' },
]

const filteredList = computed(() => {
  let list = equipList.value
  if (activeType.value !== 'all') {
    list = list.filter(item => item.type === activeType.value)
  }
  if (activeStatus.value === 'inuse') {
    list = list.filter(item => !item.retired)
  } else {
    list = list.filter(item => item.retired)
  }
  return list
})

const inUseCount = computed(() => {
  let list = equipList.value
  if (activeType.value !== 'all') {
    list = list.filter(item => item.type === activeType.value)
  }
  return list.filter(item => !item.retired).length
})

const retiredCount = computed(() => {
  let list = equipList.value
  if (activeType.value !== 'all') {
    list = list.filter(item => item.type === activeType.value)
  }
  return list.filter(item => item.retired).length
})

const isEmptyList = computed(()=>{
	return equipList.value.length === 0
})

function loadData() {
  equipList.value = getEquipList()
}

function getCardImage(item) {
  return getModelImageUrl(item.brand, item.model) || getBrandLogo(item.brand)
}

function calcUsageTime(buyDate) {
  if (!buyDate) return null
  const buy = new Date(buyDate)
  const now = new Date()
  const diff = now - buy
  if (diff < 0) return '尚未使用'
  const days = Math.floor(diff / 86400000)
  if (days < 30) return `${days} 天`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} 个月`
  const years = Math.floor(days / 365)
  const remainMonths = Math.floor((days % 365) / 30)
  return remainMonths > 0 ? `${years} 年 ${remainMonths} 个月` : `${years} 年`
}

function goDetail(id) {
  uni.navigateTo({ url: `/pages/equip-detail/equip-detail?id=${id}` })
}

function openAddPanel() {
  equipAddRef.value.open()
}

function onEquipAdded() {
  loadData()
}

onShow(() => {
  loadData()
})
</script>

<template>
  <view class="container">
    <view class="header">
      <view class="header-left">
        <text class="header-title-white">Equipment</text>
        <text class="header-title-accent">Library</text>
      </view>
      <view class="header-right" v-if="!isEmptyList">
        <button class="capsule capsule-add" @tap="openAddPanel">
          <view class="capsule-add-icon">+</view>
          <view class="capsule-add-text">Add</view>
        </button>
      </view>
    </view>

    <view class="filters" v-if="!isEmptyList">
      <scroll-view scroll-x class="type-filter-row" :show-scrollbar="false">
        <view
          v-for="opt in typeFilterOptions"
          :key="opt.key"
          class="type-capsule"
          :class="{ active: activeType === opt.key }"
          @tap="activeType = opt.key"
        >
          <text class="type-capsule-text">{{ opt.label }}</text>
        </view>
      </scroll-view>

      <view class="status-tabs">
        <view
          class="status-tab"
          :class="{ active: activeStatus === 'inuse' }"
          @tap="activeStatus = 'inuse'"
        >
          <text class="status-tab-text">In Use ({{ inUseCount }})</text>
        </view>
        <view
          class="status-tab"
          :class="{ active: activeStatus === 'retired' }"
          @tap="activeStatus = 'retired'"
        >
          <text class="status-tab-text">Retired ({{ retiredCount }})</text>
        </view>
      </view>
    </view>

    <EquipEmpty v-if="isEmptyList" @add="openAddPanel" />

    <view v-else class="list-section">
      <view v-if="filteredList.length === 0" class="empty-filter">
        <text class="empty-filter-text">没有匹配的装备</text>
      </view>

      <view v-else class="list">
        <view
          v-for="item in filteredList"
          :key="item.id"
          class="card"
          @tap="goDetail(item.id)"
        >
          <image
            class="card-bg"
            :src="getCardImage(item)"
            mode="aspectFill"
          />
          <view class="card-overlay"></view>
          <view class="card-content">
            <view class="card-top">
              <view class="card-info">
                <text class="card-name">{{ item.brand }} {{ item.model }}</text>
                <text class="card-date">购入 {{ item.buyDate || 'N/A' }}</text>
              </view>
              <text class="card-type-badge">{{ typeLabels[item.type] || item.type }}</text>
            </view>
            <view class="card-mid">
              <text class="card-usage-label">已使用</text>
              <text class="card-usage-value">{{ calcUsageTime(item.buyDate) || '—' }}</text>
            </view>
            <view class="card-bottom">
              <text class="card-price" v-if="item.price">¥{{ item.price }}</text>
              <text class="card-status" :class="{ retired: item.retired }">
                {{ item.retired ? '已淘汰' : '使用中' }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <EquipAdd ref="equipAddRef" @added="onEquipAdded" />
  </view>
</template>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #0a0e14;
  padding-bottom: 40rpx;
}

/* Header */
.header {
  padding: 40rpx 40rpx 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}
.header-right {
  display: flex;
  align-items: center;
}
.header-title-white {
  font-size: 42rpx;
  font-weight: 800;
  color: #ffffff;
}
.header-title-accent {
  font-size: 42rpx;
  font-weight: 800;
  color: #C8FF1F;
}

/* Capsule */
.capsule {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #3a3f4a;
  border-radius: 40rpx;
}
.capsule-add {
  padding: 14rpx 24rpx;
  gap: 6rpx;
  background: #C8FF1F;
  border-color: #C8FF1F;
  margin: 0;
  border: none;
  outline: none;
  line-height: 1;
}
.capsule-add-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #0a0e14;
  font-weight: 500;
  line-height: 28rpx;
}
.capsule-add-text {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #0a0e14;
  font-weight: 500;
  line-height: 28rpx;
}

/* Filters */
.filters {
  padding: 16rpx 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

/* Type capsule row */
.type-filter-row {
  white-space: nowrap;
}
.type-capsule {
  display: inline-flex;
  align-items: center;
  padding: 12rpx 30rpx;
  margin-right: 16rpx;
  border-radius: 40rpx;
  border: 1rpx solid #3a3f4a;
  background: transparent;
}
.type-capsule.active {
  border-color: #C8FF1F;
  background: transparent;
}
.type-capsule-text {
  font-size: 26rpx;
  color: #9ca3af;
  font-weight: 500;
}
.type-capsule.active .type-capsule-text {
  color: #C8FF1F;
  font-weight: 600;
}

/* Status segmented tabs */
.status-tabs {
  display: flex;
  background: #1a1f2a;
  border-radius: 40rpx;
  padding: 6rpx;
}
.status-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18rpx 0;
  border-radius: 36rpx;
}
.status-tab.active {
  background: #2a3040;
}
.status-tab-text {
  font-size: 26rpx;
  color: #5c5c6e;
  font-weight: 500;
}
.status-tab.active .status-tab-text {
  color: #ffffff;
  font-weight: 500;
}

.empty-filter {
  padding: 120rpx 40rpx;
  display: flex;
  justify-content: center;
}
.empty-filter-text {
  font-size: 26rpx;
  color: #5c5c6e;
}

/* List Section */
.list-section {
  position: relative;
}
.list {
  padding: 20rpx 30rpx 120rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* Card */
.card {
  position: relative;
  border-radius: 20rpx;
  overflow: hidden;
  min-height: 240rpx;
}
.card-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.15) 100%);
}
.card-content {
  position: relative;
  z-index: 1;
  padding: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.card-info {
  flex: 1;
  margin-right: 16rpx;
}
.card-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
  display: block;
  margin-bottom: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-date {
  font-size: 22rpx;
  color: rgba(255,255,255,0.6);
}
.card-type-badge {
  font-size: 22rpx;
  color: #ffffff;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(4px);
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
  border: 1rpx solid rgba(255,255,255,0.15);
}

.card-mid {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}
.card-usage-label {
  font-size: 22rpx;
  color: rgba(255,255,255,0.5);
}
.card-usage-value {
  font-size: 40rpx;
  font-weight: 800;
  color: #C8FF1F;
  letter-spacing: 1rpx;
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4rpx;
}
.card-price {
  font-size: 28rpx;
  color: #fbbf24;
  font-weight: 700;
}
.card-status {
  font-size: 24rpx;
  color: #4ade80;
  font-weight: 600;
  background: rgba(74, 222, 128, 0.15);
  padding: 4rpx 18rpx;
  border-radius: 20rpx;
}
.card-status.retired {
  color: #6b7280;
  background: rgba(107, 114, 128, 0.15);
}

/* FAB */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  background: #C8FF1F;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 6rpx 20rpx rgba(200, 255, 31, 0.2);
  z-index: 99;
}
.fab-icon {
  font-size: 48rpx;
  color: #0a0e14;
  font-weight: 300;
  line-height: 1;
}
</style>
