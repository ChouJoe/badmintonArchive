<script setup>
defineProps({
  value: { type: Number, default: 0 },
})
</script>

<template>
  <view class="progress-row">
    <view class="progress-track">
      <view class="progress-fill" :style="{ width: value + '%' }"></view>
    </view>
    <view class="progress-label">
      <slot></slot>
    </view>
  </view>
</template>

<style scoped>
.progress-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.progress-track {
  flex: 1;
  height: 20rpx;
  border-radius: 10rpx;
  background-color: #1e2430;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 10rpx;
  background-color: #C8FF1F;
  transition: width 0.3s ease;
}
.progress-label {
  font-size: 24rpx;
  color: #9ca3af;
  flex-shrink: 0;
}
</style>
