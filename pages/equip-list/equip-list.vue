<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore, FREE_EQUIP_LIMIT } from '@/stores/user'
import { useEquipmentStore } from '@/stores/equipment'
import { useExpenseStore } from '@/stores/expense'
import { useStringingStore } from '@/stores/stringing'
import { useGripStore } from '@/stores/grip'
import { EQUIP_TYPE_ICONS } from '@/utils/equipment-data'
import EquipCard from '@/components/EquipCard.vue'
import EquipEmpty from './equip-empty.vue'

const userStore = useUserStore()
const store = useEquipmentStore()
const expenseStore = useExpenseStore()
const stringingStore = useStringingStore()
const gripStore = useGripStore()

const activeType = ref('all')
const activeStatus = ref('inuse')

const typeFilterOptions = [
  { key: 'all', label: '全部' },
  { key: 'racket', label: '球拍' },
  { key: 'shoes', label: '球鞋' },
  { key: 'shuttle', label: '羽毛球' },
  { key: 'bag', label: '球包' },
  { key: 'other', label: '其他' },
]

const filteredList = computed(() => {
  let list = store.list
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
  let list = store.list
  if (activeType.value !== 'all') {
    list = list.filter(item => item.type === activeType.value)
  }
  return list.filter(item => !item.retired).length
})

const retiredCount = computed(() => {
  let list = store.list
  if (activeType.value !== 'all') {
    list = list.filter(item => item.type === activeType.value)
  }
  return list.filter(item => item.retired).length
})

const isEmptyList = computed(() => store.list.length === 0)

function goDetail(id) {
  uni.navigateTo({ url: `/pages-equip/equip-detail/equip-detail?id=${id}` })
}

function openAddPanel() {
  if (!userStore.vip && store.list.length >= FREE_EQUIP_LIMIT) {
    uni.showModal({
      title: '已达免费限制',
      content: `免费用户最多添加 ${FREE_EQUIP_LIMIT} 件装备。升级完整版即可解除限制。`,
      showCancel: false,
      confirmText: '前往订阅',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/profile/vip' })
        }
      }
    })
    return
  }
  uni.navigateTo({ url: '/pages-equip/equip-form/equip-form' })
}

onShow(async () => {
  await Promise.all([userStore.load(), store.load(), expenseStore.load(), stringingStore.load(), gripStore.load()])
  if (store.list.length > 0) {
    await expenseStore.migrateFromEquipment(store.list)
  }
})
</script>

<template>
  <view class="container">
    <view class="header">
      <view class="header-left">
        <text class="header-title-white">装备</text>
        <text class="header-title-accent">库</text>
      </view>
      <view class="header-right" v-if="!isEmptyList">
        <button class="capsule capsule-add" @tap="openAddPanel">
          <view class="capsule-add-icon">+</view>
          <view class="capsule-add-text">添加</view>
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
          <text class="status-tab-text">使用中 ({{ inUseCount }})</text>
        </view>
        <view
          class="status-tab"
          :class="{ active: activeStatus === 'retired' }"
          @tap="activeStatus = 'retired'"
        >
          <text class="status-tab-text">已淘汰 ({{ retiredCount }})</text>
        </view>
      </view>
    </view>

    <view v-if="!isEmptyList && !userStore.isVIP" class="vip-banner" @tap="uni.navigateTo({ url: '/pages/profile/vip' })">
      <text class="vip-banner-text">免费用户仅限添加 2 件装备 · 点击升级完整版</text>
      <text class="vip-banner-arrow">›</text>
    </view>

    <EquipEmpty v-if="isEmptyList" @add="openAddPanel" />

    <view v-else class="list-section">
      <view v-show="filteredList.length === 0" class="empty-filter">
        <text class="empty-filter-text">没有匹配的装备</text>
      </view>

      <view v-show="filteredList.length > 0" class="list">
        <EquipCard
          v-for="item in filteredList"
          :key="item.id"
          :item="item"
          :type-labels="EQUIP_TYPE_ICONS"
          @click="goDetail(item.id)"
        />
      </view>
    </view>

  </view>
</template>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #111318;
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

/* VIP Banner */
.vip-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16rpx 30rpx 0;
  padding: 16rpx 24rpx;
  background: rgba(200, 255, 31, 0.08);
  border: 1rpx solid rgba(200, 255, 31, 0.2);
  border-radius: 16rpx;
}
.vip-banner:active {
  background: rgba(200, 255, 31, 0.12);
}
.vip-banner-text {
  font-size: 22rpx;
  color: #C8FF1F;
}
.vip-banner-arrow {
  font-size: 28rpx;
  color: #C8FF1F;
  margin-left: 12rpx;
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
