<script setup>
const emit = defineEmits(['add'])

function handleAdd() {
  emit('add')
}
</script>

<template>
  <view class="empty">
    <view class="empty-illustration">
      <image
        class="empty-image"
        src="/static/icons/equipment.png"
        mode="aspectFit"
      />
    </view>

    <view class="empty-text-area">
      <text class="empty-title-white">Your gear archive</text>
      <text class="empty-title-accent">starts here.</text>
    </view>

    <text class="empty-desc">
      Add your rackets, shoes, shuttles — and build a living record of your badminton gear over time.
    </text>

    <view class="empty-cta" @tap="handleAdd">
      <text class="empty-cta-text">+   Add Your First Piece of Gear</text>
    </view>

    <text class="empty-hint">Tap any card later to edit or remove it</text>
  </view>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 50rpx 0;
  font-family: sans-serif;
}
.empty-illustration {
  width: 400rpx;
  height: 400rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40rpx;
}
.empty-image {
  width: 400rpx;
  height: 400rpx;
}
.empty-text-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24rpx;
}
.empty-title-white {
  font-size: 38rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.4;
}
.empty-title-accent {
  font-size: 38rpx;
  font-weight: 700;
  color: #C8FF1F;
  line-height: 1.4;
}
.empty-desc {
  font-size: 28rpx;
  color: #6b7280;
  text-align: center;
  line-height: 1.7;
  margin-bottom: 60rpx;
  padding: 0 20rpx;
}
.empty-cta {
  width: 100%;
  background-color: #C8FF1F;
  border-radius: 50rpx;
  padding: 32rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30rpx;
}
.empty-cta-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #0a0e14;
}
.empty-hint {
  font-size: 24rpx;
  color: #4b5563;
  text-align: center;
}
</style>
