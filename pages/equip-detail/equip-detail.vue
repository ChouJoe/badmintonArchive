<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getEquipById, deleteEquip } from '@/utils/storage'

const equip = ref(null)
const equipId = ref(null)

const typeLabels = {
  racket: '球拍',
  shoes: '球鞋',
  bag: '球包',
  other: '其他'
}

onLoad((options) => {
  if (options.id) {
    equipId.value = Number(options.id)
    equip.value = getEquipById(equipId.value)
  }
})

function goEdit() {
  uni.navigateTo({ url: `/pages/equip-edit/equip-edit?id=${equipId.value}` })
}

function handleDelete() {
  uni.showModal({
    title: '确认删除',
    content: '确认删除这件装备记录吗？此操作不可恢复。',
    success: (res) => {
      if (res.confirm) {
        deleteEquip(equipId.value)
        uni.showToast({ title: '删除成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 500)
      }
    }
  })
}
</script>

<template>
  <view class="container">
    <view v-if="equip" class="detail-card">
      <view class="detail-header">
        <text class="detail-name">{{ equip.brand }} {{ equip.model }}</text>
        <text class="detail-type">{{ typeLabels[equip.type] || equip.type }}</text>
      </view>

      <view class="info-list">
        <view class="info-row">
          <text class="info-label">品牌</text>
          <text class="info-value">{{ equip.brand }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">型号</text>
          <text class="info-value">{{ equip.model }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">类型</text>
          <text class="info-value">{{ typeLabels[equip.type] || equip.type }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">价格</text>
          <text class="info-value">{{ equip.price ? `¥${equip.price}` : '未填写' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">购买日期</text>
          <text class="info-value">{{ equip.buyDate || '未填写' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">使用时间</text>
          <text class="info-value">{{ equip.usage || '0' }} 天</text>
        </view>
        <view class="info-row">
          <text class="info-label">使用状态</text>
          <text class="info-value" :class="{ retired: equip.retired }">
            {{ equip.retired ? '已淘汰' : '使用中' }}
          </text>
        </view>
        <view v-if="equip.note" class="info-row note-row">
          <text class="info-label">备注</text>
          <text class="info-value note-value">{{ equip.note }}</text>
        </view>
      </view>
    </view>

    <view v-else class="empty">
      <text class="empty-text">装备不存在</text>
    </view>

    <view v-if="equip" class="actions">
      <view class="btn btn-edit" @tap="goEdit">
        <text>编辑</text>
      </view>
      <view class="btn btn-delete" @tap="handleDelete">
        <text>删除</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.container {
  min-height: 100vh;
  padding: 30rpx;
  background-color: #0f1117;
}
.detail-card {
  background: #1a1d27;
  border-radius: 16rpx;
  padding: 30rpx;
}
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 30rpx;
  border-bottom: 1rpx solid #2a2d3a;
  margin-bottom: 30rpx;
}
.detail-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #e4e4e7;
  flex: 1;
  margin-right: 16rpx;
}
.detail-type {
  font-size: 24rpx;
  color: #fff;
  background: #5b9bd5;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}
.info-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.info-row {
  display: flex;
  align-items: flex-start;
}
.info-label {
  width: 140rpx;
  font-size: 28rpx;
  color: #5c5c6e;
  flex-shrink: 0;
}
.info-value {
  font-size: 28rpx;
  color: #e4e4e7;
  flex: 1;
}
.info-value.retired {
  color: #4a4a5a;
}
.note-row {
  flex-direction: column;
}
.note-value {
  margin-top: 12rpx;
  line-height: 1.6;
  color: #a1a1aa;
}
.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 200rpx 0;
}
.empty-text {
  font-size: 28rpx;
  color: #5c5c6e;
}
.actions {
  margin-top: 60rpx;
  display: flex;
  gap: 30rpx;
}
.btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32rpx;
  font-weight: 600;
}
.btn-edit {
  background: #5b9bd5;
  color: #fff;
}
.btn-delete {
  background: #1a1d27;
  color: #ef4444;
  border: 2rpx solid #ef4444;
}
</style>
