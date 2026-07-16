<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useEquipmentStore } from '@/stores/equipment'
import EditProfile from '@/components/EditProfile.vue'
import AboutApp from '@/components/AboutApp.vue'

const userStore = useUserStore()
const equipmentStore = useEquipmentStore()

const showEditPopup = ref(false)
const showAboutPopup = ref(false)

onShow(() => {
  userStore.load()
  equipmentStore.load()
})
</script>

<template>
  <view class="container">
    <!-- Header -->
    <view class="header">
      <view class="header-left">
        <view class="avatar-wrap">
          <image v-if="userStore.avatar" class="avatar" :src="userStore.avatar" mode="aspectFill" />
          <view v-else class="avatar avatar-default"></view>
        </view>
        <text class="nickname">{{ userStore.nickname || '请输入昵称' }}</text>
      </view>
      <view class="header-edit" @tap="showEditPopup = true">
        <image class="edit-icon" src="/static/icons/edit.svg" mode="aspectFit" />
      </view>
    </view>

    <!-- 基本资料 -->
    <view class="section">
      <text class="section-label">基本资料</text>
      <view class="info-card">
        <view class="info-row">
          <text class="info-key">性别</text>
          <text class="info-value">{{ userStore.gender || '未设置' }}</text>
        </view>
        <view class="info-row">
          <text class="info-key">级别</text>
          <text class="info-value">{{ userStore.level ? userStore.level + ' 级' : '未设置' }}</text>
        </view>
        <view class="info-row">
          <text class="info-key">持拍手</text>
          <text class="info-value">{{ userStore.dominantHand || '未设置' }}</text>
        </view>
      </view>
    </view>

    <!-- 关于羽札 -->
    <view class="section">
      <text class="section-label">关于羽札</text>
      <view class="info-card">
        <view class="info-row info-row-tap" @tap="showAboutPopup = true">
          <text class="info-key">关于羽札</text>
          <text class="info-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- Popups -->
    <EditProfile :visible="showEditPopup" @close="showEditPopup = false" />
    <AboutApp :visible="showAboutPopup" @close="showAboutPopup = false" />
  </view>
</template>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #0f1117;
  padding-bottom: 120rpx;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 48rpx 40rpx 40rpx;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}
.avatar-wrap {
  flex-shrink: 0;
}
.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 48rpx;
}
.avatar-default {
  background: #3a3f4a;
}
.nickname {
  font-size: 34rpx;
  font-weight: 700;
  color: #e5e5e7;
}
.header-edit {
  width: 64rpx;
  height: 64rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.edit-icon {
  width: 44rpx;
  height: 44rpx;
}

/* Section */
.section {
  padding: 0 40rpx;
  margin-top: 32rpx;
}
.section-label {
  font-size: 24rpx;
  font-weight: 600;
  color: #C8FF1F;
  margin-bottom: 20rpx;
  display: block;
}

/* Info Card */
.info-card {
  background: #1a1d27;
  border-radius: 20rpx;
  overflow: hidden;
}
.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx;
  border-bottom: 1rpx solid #252830;
}
.info-row:last-child {
  border-bottom: none;
}
.info-row-tap:active {
  background: #252830;
}
.info-key {
  font-size: 28rpx;
  color: #9ca3af;
}
.info-value {
  font-size: 28rpx;
  color: #e5e5e7;
}
.info-arrow {
  font-size: 32rpx;
  color: #6b7280;
}
</style>
