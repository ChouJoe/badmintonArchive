<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isLoading = ref(false)

const features = [
  { label: '装备数量', free: '2 件', pro: '不限' },
  { label: '穿线记录', free: '1 条', pro: '不限' },
  { label: '手胶记录', free: '1 条', pro: '不限' },
  { label: '消费统计', free: '✗', pro: '✓' },
  { label: '装备使用周期进度条', free: '✗', pro: '✓' },
  { label: '更换装备提示', free: '✗', pro: '✓' },
  { label: '上传装备照片', free: '✗', pro: '开发中' },
  { label: '更多功能', free: '✗', pro: '开发中' },
]

onShow(async () => {
  await userStore.load()
})

async function checkStatus() {
  isLoading.value = true
  await userStore.load()
  isLoading.value = false
  if (userStore.isVIP) {
    uni.showToast({ title: '已激活完整版', icon: 'success' })
  } else {
    uni.showToast({ title: '暂未激活，请先联系客服', icon: 'none' })
  }
}
</script>

<template>
  <view class="page">
    <view class="page-header">
      <navigator class="header-back" open-type="navigateBack" hover-class="header-back-hover">
        <image class="back-icon" src="/static/icons/back.svg" mode="aspectFit" />
      </navigator>
      <text class="page-title">升级完整版</text>
      <view class="header-spacer"></view>
    </view>

    <scroll-view scroll-y class="page-body">
      <view class="hero">
        <text class="hero-title">羽札 · 完整版</text>
        <view class="hero-price-row">
          <text class="hero-price-original">¥4.99</text>
          <text class="hero-price">¥1.99</text>
        </view>
        <text class="hero-tag">限时优惠 · 一次性买断，永久使用</text>
      </view>

      <view v-if="userStore.isVIP" class="vip-badge">
        <text class="vip-badge-text">已激活完整版，感谢支持</text>
      </view>

      <view class="compare-section">
        <text class="section-title">功能对比</text>
        <view class="compare-table">
          <view class="compare-header">
            <text class="compare-cell compare-cell-feature">功能</text>
            <text class="compare-cell compare-cell-free">免费版</text>
            <text class="compare-cell compare-cell-pro">完整版</text>
          </view>
          <view
            v-for="(feat, idx) in features"
            :key="idx"
            class="compare-row"
            :class="{ 'compare-row-alt': idx % 2 === 1 }"
          >
            <text class="compare-cell compare-cell-feature">{{ feat.label }}</text>
            <text class="compare-cell compare-cell-free">{{ feat.free }}</text>
            <text class="compare-cell compare-cell-pro">{{ feat.pro }}</text>
          </view>
        </view>
      </view>

      <view class="steps-section" v-if="!userStore.isVIP">
        <text class="section-title">开通流程</text>
        <view class="steps">
          <view class="step">
            <view class="step-num">1</view>
            <view class="step-body">
              <text class="step-title">微信转账</text>
              <text class="step-desc">微信转账 1.99 元至管理员</text>
            </view>
          </view>
          <view class="step">
            <view class="step-num">2</view>
            <view class="step-body">
              <text class="step-title">点击联系客服</text>
              <text class="step-desc">发送付款截图，并告知你的用户 ID（在「我的」页面可复制）</text>
            </view>
          </view>
          <view class="step">
            <view class="step-num">3</view>
            <view class="step-body">
              <text class="step-title">等待激活</text>
              <text class="step-desc">管理员确认后为你激活，通常 24 小时内完成</text>
            </view>
          </view>
          <view class="step">
            <view class="step-num">4</view>
            <view class="step-body">
              <text class="step-title">点击下方按钮检查</text>
              <text class="step-desc">激活完成后点击检查，即可解锁全部功能</text>
            </view>
          </view>
        </view>
      </view>

      <view class="actions" v-if="!userStore.isVIP">
        <button class="contact-btn" open-type="contact">
          <text class="contact-btn-text">联系客服开通</text>
        </button>
        <view class="check-btn" @tap="checkStatus">
          <text class="check-btn-text">{{ isLoading ? '检测中...' : '检查激活状态' }}</text>
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
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 80rpx 20rpx 10rpx 20rpx;
}
.header-back {
  padding: 8rpx;
  flex-shrink: 0;
}
.header-back-hover {
  opacity: 0.5;
}
.back-icon {
  width: 40rpx;
  height: 40rpx;
  display: block;
}
.page-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
}
.header-spacer {
  width: 56rpx;
  flex-shrink: 0;
}

.page-body {
  padding: 0 36rpx;
  box-sizing: border-box;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0 40rpx;
}
.hero-title {
  font-size: 36rpx;
  font-weight: 800;
  color: #ffffff;
}
.hero-price-row {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  margin: 12rpx 0;
}
.hero-price-original {
  font-size: 32rpx;
  font-weight: 600;
  color: #6b7280;
  text-decoration: line-through;
}
.hero-price {
  font-size: 72rpx;
  font-weight: 900;
  color: #C8FF1F;
}
.hero-tag {
  font-size: 24rpx;
  color: #f59e0b;
}

.vip-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  background: rgba(200, 255, 31, 0.08);
  border: 1rpx solid rgba(200, 255, 31, 0.3);
  border-radius: 16rpx;
  margin-bottom: 40rpx;
}
.vip-badge-text {
  font-size: 26rpx;
  color: #C8FF1F;
  font-weight: 600;
}

.section-title {
  font-size: 22rpx;
  font-weight: 700;
  color: #6b7280;
  letter-spacing: 1rpx;
  margin-bottom: 20rpx;
  display: block;
}

.compare-section {
  margin-bottom: 40rpx;
}
.compare-table {
  background: #1a1d27;
  border-radius: 16rpx;
  overflow: hidden;
}
.compare-header {
  display: flex;
  padding: 24rpx 20rpx;
  border-bottom: 1rpx solid #252830;
}
.compare-row {
  display: flex;
  padding: 20rpx;
  border-bottom: 1rpx solid #252830;
}
.compare-row:last-child {
  border-bottom: none;
}
.compare-row-alt {
  background: rgba(255,255,255,0.02);
}
.compare-cell {
  font-size: 26rpx;
}
.compare-cell-feature {
  flex: 2;
  color: #e5e5e7;
}
.compare-cell-free {
  flex: 1;
  color: #6b7280;
  text-align: center;
}
.compare-cell-pro {
  flex: 1;
  color: #C8FF1F;
  text-align: center;
  font-weight: 600;
}

.steps-section {
  margin-bottom: 40rpx;
}
.steps {
  background: #1a1d27;
  border-radius: 16rpx;
  padding: 12rpx 0;
}
.step {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding: 24rpx 24rpx;
  border-bottom: 1rpx solid #252830;
}
.step:last-child {
  border-bottom: none;
}
.step-num {
  width: 44rpx;
  height: 44rpx;
  border-radius: 22rpx;
  background: #C8FF1F;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
  color: #0a0e14;
  flex-shrink: 0;
}
.step-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.step-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #ffffff;
}
.step-desc {
  font-size: 22rpx;
  color: #6b7280;
  line-height: 1.5;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  align-items: center;
}

.contact-btn {
  width: 100%;
  max-width: 500rpx;
  height: 88rpx;
  background: #C8FF1F;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  margin: 0;
}
.contact-btn::after {
  border: none;
}
.contact-btn:active {
  opacity: 0.85;
}
.contact-btn-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #0a0e14;
}

.check-btn {
  padding: 20rpx 60rpx;
  border: 1rpx solid #3a3f4a;
  border-radius: 40rpx;
}
.check-btn:active {
  background: rgba(255,255,255,0.05);
}
.check-btn-text {
  font-size: 24rpx;
  color: #9ca3af;
}

.bottom-spacer {
  height: 120rpx;
}
</style>
