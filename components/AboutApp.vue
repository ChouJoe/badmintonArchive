<script setup>
defineProps({
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])
</script>

<template>
  <view v-if="visible" class="popup-mask" @tap.self="emit('close')">
    <view class="popup-panel">
      <view class="popup-header">
        <text class="popup-title">关于羽札</text>
        <view class="popup-close" @tap="emit('close')">
          <text class="popup-close-icon">✕</text>
        </view>
      </view>
      <view class="about-content">
        <view class="about-logo-wrap">
          <image class="about-logo" src="/static/icons/yuzhaLogo.svg" mode="scaleToFill" />
        </view>
        <text class="about-version">羽札 v1.0.0</text>
        <text class="about-desc">你的个人羽毛球生活管理工具</text>
        <view class="about-info">
          <text class="about-info-text">记录装备 · 追踪球局 · 管理体验</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}
.popup-panel {
  width: 100%;
  background: #1a1d27;
  border-radius: 32rpx 32rpx 0 0;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
}
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 36rpx 24rpx;
  border-bottom: 1rpx solid #252830;
  flex-shrink: 0;
}
.popup-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
}
.popup-close {
  width: 56rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background: #252830;
  display: flex;
  align-items: center;
  justify-content: center;
}
.popup-close-icon {
  font-size: 26rpx;
  color: #9ca3af;
}
.about-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
}
.about-logo-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 28rpx;
  background: #252830;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}
.about-logo {
  width: 120rpx;
  height: 120rpx;
}
.about-version {
  font-size: 30rpx;
  font-weight: 700;
  color: #e5e5e7;
  margin-bottom: 12rpx;
}
.about-desc {
  font-size: 26rpx;
  color: #9ca3af;
  margin-bottom: 40rpx;
}
.about-info {
  padding: 24rpx 0;
}
.about-info-text {
  font-size: 24rpx;
  color: #6b7280;
}
</style>
