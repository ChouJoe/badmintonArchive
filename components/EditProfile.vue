<script setup>
import { ref, watch, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { ensureSession } from '@/utils/auth'

const userStore = useUserStore()

const genderOptions = ['男', '女']
const handOptions = ['右手', '左手']
const levelOptions = []
for (let i = 1; i <= 5; i += 0.5) {
  levelOptions.push(String(i))
}

const showLevelPicker = ref(false)
const pendingFileID = ref('')

const formValid = computed(() => {
  return (
    editForm.value.nickname.trim() !== '' &&
    editForm.value.gender !== '' &&
    editForm.value.level > 0 &&
    editForm.value.dominantHand !== ''
  )
})

const props = defineProps({
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const editForm = ref({
  avatar: '',
  nickname: '',
  gender: '',
  level: 0,
  dominantHand: '',
})

function onOpen() {
  editForm.value = {
    avatar: userStore.avatar || '',
    nickname: userStore.nickname || '',
    gender: userStore.gender || '',
    level: userStore.level || 0,
    dominantHand: userStore.dominantHand || '',
  }
  pendingFileID.value = ''
}

async function onChooseAvatar(e) {
  const tempPath = e.detail.avatarUrl
  try {
    const session = await ensureSession()
    const ext = tempPath.split('.').pop() || 'jpg'
    const result = await uniCloud.uploadFile({
      filePath: tempPath,
      cloudPath: `avatars/${session.uid}_${Date.now()}.${ext}`,
    })
    pendingFileID.value = result.fileID
    let previewUrl = ''
    try {
      const urlRes = await uniCloud.getTempFileURL({
        fileList: [result.fileID]
      })
      previewUrl = urlRes.fileList?.[0]?.tempFileURL
    } catch {}
    if (!previewUrl || previewUrl.startsWith('cloud://')) {
      const match = result.fileID.match(/^cloud:\/\/([^/]+)\/(.+)$/)
      if (match) {
        previewUrl = `https://${match[1]}.normal.cloudstatic.cn/${match[2]}`
      }
    }
    editForm.value.avatar = previewUrl || ''
  } catch (err) {
    console.error('Avatar upload failed:', err)
    uni.showToast({ title: '头像上传失败', icon: 'none' })
  }
}

async function save() {
  const data = { ...editForm.value }
  if (pendingFileID.value) {
    data.avatar = pendingFileID.value
  }
  await userStore.updateProfile(data)
  emit('close')
  uni.showToast({ title: '已保存', icon: 'success' })
}

watch(() => props.visible, (val) => {
  if (val) {
    onOpen()
  }
})

function close() {
  emit('close')
}

function openLevelPicker() {
  showLevelPicker.value = true
}

function closeLevelPicker() {
  showLevelPicker.value = false
}

function selectLevel(level) {
  editForm.value.level = parseFloat(level)
  showLevelPicker.value = false
}
</script>

<template>
  <view v-if="props.visible" class="popup-overlay" @tap.self="close">
    <view class="popup-panel" @tap.stop>
      <!-- Drag indicator -->
      <view class="panel-indicator">
        <view class="panel-indicator-bar"></view>
      </view>

      <!-- Header -->
      <view class="popup-header">
        <text class="popup-title">编辑资料</text>
        <view class="popup-close" @tap="close">
          <text class="popup-close-icon">✕</text>
        </view>
      </view>

      <!-- Scrollable form -->
      <scroll-view scroll-y class="popup-body">
        <!-- Avatar -->
        <view class="edit-avatar-section">
          <button class="edit-avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <image v-if="editForm.avatar" class="edit-avatar-img" :src="editForm.avatar" mode="aspectFill" />
            <view v-else class="edit-avatar-img edit-avatar-placeholder"></view>
            <text class="edit-avatar-hint">点击更换头像</text>
          </button>
        </view>

        <!-- Nickname -->
        <view class="edit-field">
          <text class="edit-label">昵称</text>
          <view class="edit-input-wrap">
            <input
              class="edit-input"
              type="nickname"
              :value="editForm.nickname"
              @input="e => editForm.nickname = e.detail.value"
              placeholder="请输入昵称"
              placeholder-class="edit-input-placeholder"
            />
          </view>
        </view>

        <!-- Gender -->
        <view class="edit-field">
          <text class="edit-label">性别</text>
          <view class="chip-row">
            <view
              v-for="opt in genderOptions"
              :key="opt"
              class="chip"
              :class="{ active: editForm.gender === opt }"
              @tap="editForm.gender = opt"
            >
              <text class="chip-text">{{ opt }}</text>
            </view>
          </view>
        </view>

        <!-- Level -->
        <view class="edit-field">
          <text class="edit-label">级别</text>
          <view class="selector-trigger" @tap="openLevelPicker">
            <text :class="editForm.level ? 'selector-text' : 'selector-placeholder'">
              {{ editForm.level ? editForm.level + ' 级' : '请选择级别' }}
            </text>
            <text class="selector-arrow">▾</text>
          </view>
        </view>

        <!-- Dominant Hand -->
        <view class="edit-field">
          <text class="edit-label">持拍手</text>
          <view class="chip-row">
            <view
              v-for="opt in handOptions"
              :key="opt"
              class="chip"
              :class="{ active: editForm.dominantHand === opt }"
              @tap="editForm.dominantHand = opt"
            >
              <text class="chip-text">{{ opt }}</text>
            </view>
          </view>
        </view>
		  <!-- Footer -->
		  <view class="popup-footer">
			<button class="save-btn" :disabled="!formValid" @tap="save">
			  <text class="save-btn-text">保存</text>
			</button>
		  </view>
        <view class="bottom-spacer"></view>
      </scroll-view>


      <!-- Level Picker Overlay -->
      <view v-if="showLevelPicker" class="picker-overlay" @tap.self="closeLevelPicker">
        <view class="picker-panel">
          <view class="picker-header">
            <text class="picker-title">选择级别</text>
            <view class="picker-close" @tap="closeLevelPicker">
              <text class="picker-close-icon">✕</text>
            </view>
          </view>
          <scroll-view scroll-y class="picker-list">
            <view
              v-for="opt in levelOptions"
              :key="opt"
              class="picker-item"
              @tap="selectLevel(opt)"
            >
              <text class="picker-item-text">{{ opt }} 级</text>
            </view>
            <view class="picker-list-spacer"></view>
          </scroll-view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 100;
}
.popup-panel {
  background: #1a1d27;
  border-radius: 32rpx 32rpx 0 0;
  height: 85vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

/* Indicator */
.panel-indicator {
  display: flex;
  justify-content: center;
  padding: 16rpx 0 8rpx;
  flex-shrink: 0;
}
.panel-indicator-bar {
  width: 60rpx;
  height: 8rpx;
  border-radius: 4rpx;
  background-color: #3a3f4a;
}

/* Header */
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 36rpx 24rpx;
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

/* Body */
.popup-body {
  flex: 1;
  padding: 0 36rpx;
  min-height: 0;
  box-sizing: border-box;
  width: 100%;
}

.popup-footer {
  border-top: 1rpx solid #252830;
  flex-shrink: 0;
}

/* Avatar */
.edit-avatar-section {
  display: flex;
  justify-content: center;
  padding: 40rpx 0;
}
.edit-avatar-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  background: transparent;
  padding: 0;
  margin: 0;
  border: none;
  line-height: normal;
}
.edit-avatar-btn::after {
  border: none;
}
.edit-avatar-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 70rpx;
}
.edit-avatar-placeholder {
  background: #3a3f4a;
  border: 2rpx dashed #6b7280;
}
.edit-avatar-hint {
  font-size: 24rpx;
  color: #6b7280;
}

/* Fields */
.edit-field {
  margin-bottom: 36rpx;
}
.edit-label {
  font-size: 24rpx;
  font-weight: 600;
  color: #9ca3af;
  margin-bottom: 16rpx;
  display: block;
}
.edit-input-wrap {
  background: #252830;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
}
.edit-input {
  font-size: 28rpx;
  color: #ffffff;
  width: 100%;
}
.edit-input-placeholder {
  color: #4b5563;
}

/* Chips */
.chip-row {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}
.chip {
  padding: 18rpx 36rpx;
  border-radius: 32rpx;
  background: #252830;
  border: 1rpx solid #353840;
}
.chip.active {
  background: rgba(167, 139, 250, 0.12);
  border-color: #C8FF1F;
}
.chip-text {
  font-size: 26rpx;
  color: #9ca3af;
}
.chip.active .chip-text {
  color: #C8FF1F;
}

/* Selector trigger */
.selector-trigger {
  background: #252830;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.selector-text {
  font-size: 28rpx;
  color: #ffffff;
}
.selector-placeholder {
  font-size: 28rpx;
  color: #4b5563;
}
.selector-arrow {
  font-size: 24rpx;
  color: #6b7280;
}

.bottom-spacer {
  height: 200rpx;
}

/* Save */
.save-btn {
  width: 100%;
  background: #4ade80;
  border-radius: 44rpx;
  padding: 28rpx 0;
  margin: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.save-btn::after {
  border: none;
}
.save-btn[disabled] {
  opacity: 0.4;
}
.save-btn-text {
  font-size: 30rpx;
  color: #ffffff;
  font-weight: 700;
}

/* ===== Level Picker Overlay ===== */
.picker-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 10;
}
.picker-panel {
  background-color: #1a1d27;
  border-radius: 32rpx 32rpx 0 0;
  height: 60%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}
.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 36rpx 20rpx;
}
.picker-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
}
.picker-close {
  width: 56rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background: #252830;
  display: flex;
  align-items: center;
  justify-content: center;
}
.picker-close-icon {
  font-size: 26rpx;
  color: #9ca3af;
}

.picker-list {
  flex: 1;
  padding: 0 36rpx;
  min-height: 0;
}
.picker-item {
  display: flex;
  align-items: center;
  padding: 28rpx 20rpx;
  border-bottom: 1rpx solid #252830;
}
.picker-item:active {
  background-color: rgba(200, 255, 31, 0.05);
}
.picker-item-text {
  font-size: 30rpx;
  color: #e4e4e7;
}
.picker-list-spacer {
  height: 200rpx;
}
</style>
