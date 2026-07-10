<script setup>
import { getModelImageUrl, getBrandLogo } from '@/utils/equipment-data'
import Rating from './Rating.vue'
const props = defineProps({
  item: { type: Object, required: true },
  typeLabels: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['click'])

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
  return `${days} 天`

}

function onClick() {
  emit('click', props.item)
}
</script>

<template>
  <view class="card" @tap="onClick">
    <image
      class="card-bg"
      :src="getCardImage(item)"
      mode="aspectFill"
    />
    <view class="card-overlay"></view>
    <view class="card-content">
      <view class="card-top">
        <view class="card-info">
          <text class="card-name">{{ item.brand }}</text>
        </view>
        <view class="card-type-badge">
          <uni-icons fontFamily="iconfont" :size="26" color="#ffffff87" >{{typeLabels[item.type]}}</uni-icons>
        </view>
      </view>
      <view class="card-mid">
        <text class="card-usage-label">已使用</text>
        <text class="card-usage-value">{{ calcUsageTime(item.buyDate) || '—' }}</text>
      </view>
      <view class="card-bottom">
		  <view class="card-bottom-left">
			  <text class="card-model" v-if="item.model">{{ item.model }}</text>
			  <Rating :model-value="item.rating" readonly/>
		  </view>
		  <view class="card-bottom-right">
			  <text class="card-status" :class="{ retired: item.retired }">
			    {{ item.retired ? '已淘汰' : '使用中' }}
			  </text>
		  </view>
       
       
      </view>
    </view>
  </view>
</template>

<style scoped>
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
  gap: 50rpx;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.card-info {
  margin-right: 16rpx;
  border-radius: 10px;
  background-color: rgba(255,255,255,0.15);
}
.card-name {
  font-size: 20rpx;
  font-weight: 700;
  color: #ffffff;
  display: block;
  padding:10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-date {
  font-size: 22rpx;
  color: rgba(255,255,255,0.6);
}
.card-type-badge {
  width: 52rpx;
  height: 52rpx;
  border-radius: 26rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-type-badge .iconfont {
  font-size: 32rpx;
  color: #ffffff;
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
  margin-top: 4rpx;
  display: flex;
  justify-content: space-between;
}
.card-bottom-left{
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.card-bottom-right{
	display: flex;
	align-items: end;
}
.card-model{
  font-size: 1rem;
  color: #fff;
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
</style>
