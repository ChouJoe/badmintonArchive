<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { add } from '@/utils/cloud'
import { resolveCloudUrl } from '@/utils/cloud-image'

const userStore = useUserStore()
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 40

const content = ref('')
const images = ref([])
const uploading = ref(false)
const submitting = ref(false)

function goBack() {
  uni.navigateBack()
}

async function chooseImage() {
  if (uploading.value) return
  const remain = 3 - images.value.length
  if (remain <= 0) {
    uni.showToast({ title: '最多 3 张图片', icon: 'none' })
    return
  }
  uploading.value = true
  try {
    const res = await uni.chooseImage({
      count: remain,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })
    for (const tempPath of res.tempFilePaths) {
      const ext = tempPath.split('.').pop() || 'jpg'
      const uploadRes = await uniCloud.uploadFile({
        filePath: tempPath,
        cloudPath: `feedback/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      })
      const previewUrl = await resolveCloudUrl(uploadRes.fileID)
      images.value.push({
        fileID: uploadRes.fileID,
        previewUrl
      })
    }
    uploading.value = false
  } catch (e) {
    uploading.value = false
    if (e.errMsg !== 'chooseImage:fail cancel') {
      console.error('Image upload failed:', e)
      uni.showToast({ title: '图片上传失败', icon: 'none' })
    }
  }
}

function removeImage(index) {
  images.value.splice(index, 1)
}

async function submit() {
  if (!content.value.trim()) {
    uni.showToast({ title: '请填写反馈内容', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await add('feedback', {
      content: content.value.trim(),
      images: images.value.map(i => i.fileID),
      nickname: userStore.nickname || '',
      avatar: userStore.avatar || '',
    })
    uni.showToast({ title: '反馈已提交', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 800)
  } catch (e) {
    console.error('Feedback submit failed:', e)
    uni.showToast({ title: '提交失败，请重试', icon: 'none' })
    submitting.value = false
  }
}
</script>

<template>
  <view class="page" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="page-header">
      <view class="header-left" @tap="goBack">
        <image class="back-icon" src="/static/icons/back.svg" mode="aspectFit" />
      </view>
      <text class="page-title">用户反馈</text>
      <view class="header-right"></view>
    </view>

    <scroll-view scroll-y class="page-body">
      <view class="form-section">
        <text class="form-label">问题描述</text>
        <textarea
          class="form-textarea"
          v-model="content"
          placeholder="请详细描述您遇到的问题或建议..."
          placeholder-class="form-ph"
          maxlength="500"
          auto-height
        />
        <text class="form-counter">{{ content.length }}/500</text>
      </view>

      <view class="form-section">
        <text class="form-label">截图（选填，最多 3 张）</text>
        <view class="image-grid">
          <view
            v-for="(img, idx) in images"
            :key="idx"
            class="image-item"
          >
            <image class="image-preview" :src="img.previewUrl" mode="aspectFill" />
            <view class="image-remove" @tap="removeImage(idx)">
              <text class="image-remove-icon">✕</text>
            </view>
          </view>
          <view
            v-if="images.length < 3"
            class="image-uploader"
            :class="{ uploading: uploading }"
            @tap="chooseImage"
          >
            <text class="image-uploader-icon">{{ uploading ? '...' : '+' }}</text>
            <text class="image-uploader-text">{{ uploading ? '上传中' : '上传图片' }}</text>
          </view>
        </view>
      </view>

      <view class="submit-section">
        <button
          class="submit-btn"
          :disabled="submitting || uploading || !content.trim()"
          @tap="submit"
        >
          <text class="submit-btn-text">{{ submitting ? '提交中...' : '提交反馈' }}</text>
        </button>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped>
.page {
  height: 100vh;
  background-color: #0f1117;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 80rpx 20rpx 30rpx 20rpx;
  flex-shrink: 0;
}
.header-left {
  display: flex;
  align-items: center;
  padding: 8rpx;
}
.back-icon {
  width: 40rpx;
  height: 40rpx;
  display: block;
}
.page-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
}
.header-right {
  width: 56rpx;
}

.page-body {
  flex: 1;
  padding: 0 36rpx;
  box-sizing: border-box;
}

.form-section {
  margin-bottom: 40rpx;
}
.form-label {
  font-size: 24rpx;
  font-weight: 600;
  color: #9ca3af;
  margin-bottom: 16rpx;
  display: block;
}
.form-textarea {
  width: 100%;
  background: #1a1d27;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  font-size: 28rpx;
  color: #ffffff;
  box-sizing: border-box;
  min-height: 200rpx;
  line-height: 1.6;
}
.form-ph {
  color: #4b5563;
}
.form-counter {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: #475569;
  margin-top: 8rpx;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.image-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  overflow: hidden;
}
.image-preview {
  width: 100%;
  height: 100%;
}
.image-remove {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 18rpx;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-remove-icon {
  font-size: 20rpx;
  color: #ffffff;
}
.image-uploader {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #3a3f4a;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}
.image-uploader:active {
  background: rgba(255, 255, 255, 0.05);
}
.image-uploader.uploading {
  opacity: 0.5;
}
.image-uploader-icon {
  font-size: 48rpx;
  color: #475569;
}
.image-uploader-text {
  font-size: 22rpx;
  color: #475569;
}

.submit-section {
  padding: 20rpx 0 120rpx;
}
.submit-btn {
  width: 100%;
  background: #C8FF1F;
  border-radius: 44rpx;
  padding: 28rpx 0;
  margin: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.submit-btn::after {
  border: none;
}
.submit-btn[disabled] {
  opacity: 0.4;
}
.submit-btn-text {
  font-size: 30rpx;
  color: #0a0e14;
  font-weight: 700;
}
</style>
