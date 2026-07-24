<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad, onBackPress } from '@dcloudio/uni-app'
import { useEquipmentStore } from '@/stores/equipment'
import { useExpenseStore } from '@/stores/expense'
import { useUserStore } from '@/stores/user'
import { ensureSession } from '@/utils/auth'
import { resolveCloudUrl } from '@/utils/cloud-image'
import { getBrandsByType, getModelsByBrand, getBrandLogo, getBrandDisplayName, getModelDisplayName, EQUIP_TYPE_ICONS } from '@/utils/equipment-data'


const store = useEquipmentStore()
const expenseStore = useExpenseStore()
const userStore = useUserStore()
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 40

function getHeaderRight() {
  try {
    const menu = uni.getMenuButtonBoundingClientRect()
    const sw = uni.getSystemInfoSync().screenWidth
    return sw - menu.left + 10
  } catch (e) {
    return 88
  }
}
const headerRightPx = getHeaderRight()

const editingId = ref(null)
const isEditMode = computed(() => editingId.value !== null)
const originalForm = ref(null)

const form = ref({
  type: 'racket',
  brand: '',
  model: '',
  price: '',
  buyDate: '',
  rating: 5,
  retired: false,
  tag: '',
  note: ''
})

const showTypePicker = ref(false)
const showBrandPicker = ref(false)
const showModelPicker = ref(false)
const brandSearchText = ref('')
const modelSearchText = ref('')
const isCustomBrand = ref(false)
const isCustomModel = ref(false)

const userPhoto = ref('')
const userPhotoPreview = ref('')
const photoUploading = ref(false)

onLoad(async (query) => {
  if (query.id) {
    await store.load()
    const item = store.getEquipById(query.id)
    if (item) {
      editingId.value = item.id
      originalForm.value = { ...item }
      form.value = {
        type: item.type || 'racket',
        brand: item.brand || '',
        model: item.model || '',
        price: item.price ? String(item.price) : '',
        buyDate: item.buyDate || '',
        rating: item.rating || 5,
        retired: item.retired || false,
        tag: item.tag || '',
        note: item.note || ''
      }
      if (item.userPhoto) {
        userPhoto.value = item.userPhoto
        userPhotoPreview.value = item.userPhotoUrl || await resolveCloudUrl(item.userPhoto)
      }
    }
  }
  await expenseStore.load()
})



const simpleTypes = ['socks', 'waist', 'knee', 'ankle']

const typeOptions = [
  { key: 'racket', label: '球拍' },
  { key: 'shoes', label: '球鞋' },
  { key: 'bag', label: '球包' },
  { key: 'shuttle', label: '羽毛球' },
  { key: 'socks', label: '球袜' },
  { key: 'waist', label: '护腰' },
  { key: 'knee', label: '护膝' },
  { key: 'ankle', label: '护踝' },
  { key: 'other', label: '其他' }
]

const isSimpleType = computed(() => simpleTypes.includes(form.value.type))

const availableBrands = computed(() => {
  const brands = getBrandsByType(form.value.type)
  if (!brandSearchText.value) return brands
  const keyword = brandSearchText.value.toLowerCase()
  return brands.filter(b =>
    b.name.toLowerCase().includes(keyword) ||
    getBrandDisplayName(b.name).toLowerCase().includes(keyword)
  )
})

const availableModels = computed(() => {
  if (!form.value.brand || isCustomBrand.value) return []
  const models = getModelsByBrand(form.value.type, form.value.brand)
  if (!modelSearchText.value) return models
  const keyword = modelSearchText.value.toLowerCase()
  return models.filter(m =>
    m.toLowerCase().includes(keyword) ||
    getModelDisplayName(form.value.brand, m).toLowerCase().includes(keyword)
  )
})

const ratingBlocks = computed(() => {
  return Array.from({ length: 10 }, (_, i) => i < form.value.rating)
})

const formValid = computed(() => {
  if (isSimpleType.value) {
    return form.value.brand.trim() !== ''
  }
  return form.value.brand.trim() !== '' && form.value.model.trim() !== ''
})

const today = new Date().toISOString().split('T')[0]

const typeIcon = computed(() => {
  const icon = EQUIP_TYPE_ICONS[form.value.type]
  return icon
})

function selectType(key) {
  form.value.type = key
  if (isEditMode.value && originalForm.value && key === originalForm.value.type) {
    form.value.brand = originalForm.value.brand || ''
    form.value.model = originalForm.value.model || ''
    isCustomBrand.value = false
    isCustomModel.value = false
  } else {
    form.value.brand = ''
    form.value.model = ''
    isCustomBrand.value = false
    isCustomModel.value = false
  }
  brandSearchText.value = ''
  modelSearchText.value = ''
}

function setRating(index) {
  form.value.rating = index + 1
}

function setStatus(retired) {
  form.value.retired = retired
}

function getTypeLabel(key) {
  return typeOptions.find(t => t.key === key)?.label || ''
}

function openTypePicker() {
  showTypePicker.value = true
}

function closeTypePicker() {
  showTypePicker.value = false
}

function selectTypeFromPicker(opt) {
  if (opt.key !== form.value.type) {
    selectType(opt.key)
  }
  showTypePicker.value = false
}

function openBrandPicker() {
  brandSearchText.value = ''
  showBrandPicker.value = true
}

function closeBrandPicker() {
  showBrandPicker.value = false
}

function selectBrand(brand) {
  form.value.brand = brand.name
  isCustomBrand.value = false
  showBrandPicker.value = false
  form.value.model = ''
  isCustomModel.value = false
  modelSearchText.value = ''
}

function useCustomBrand() {
  if (brandSearchText.value.trim()) {
    form.value.brand = brandSearchText.value.trim()
    isCustomBrand.value = true
  }
  showBrandPicker.value = false
  form.value.model = ''
  isCustomModel.value = false
  modelSearchText.value = ''
}

function openModelPicker() {
  modelSearchText.value = ''
  showModelPicker.value = true
}

function closeModelPicker() {
  showModelPicker.value = false
}

function selectModel(model) {
  form.value.model = model
  isCustomModel.value = false
  showModelPicker.value = false
}

function useCustomModel() {
  if (modelSearchText.value.trim()) {
    form.value.model = modelSearchText.value.trim()
    isCustomModel.value = true
  }
  showModelPicker.value = false
}

function handleDateChange(e) {
  form.value.buyDate = e.detail.value
}

async function choosePhoto() {
  if (photoUploading.value) return
  if (!userStore.isVIP) {
    uni.showModal({
      title: '完整版功能',
      content: '上传装备照片为完整版功能，升级后即可使用。',
      showCancel: true,
      success: (res) => {
        if (res.confirm) uni.navigateTo({ url: '/pages/profile/vip' })
      }
    })
    return
  }
  try {
    const res = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })
    const tempPath = res.tempFilePaths[0]
    photoUploading.value = true
    const session = await ensureSession()
    const ext = tempPath.split('.').pop() || 'jpg'
    const uploadRes = await uniCloud.uploadFile({
      filePath: tempPath,
      cloudPath: `equipment/${session.uid}_${Date.now()}.${ext}`
    })
    userPhoto.value = uploadRes.fileID
    userPhotoPreview.value = await resolveCloudUrl(uploadRes.fileID)
  } catch (e) {
    if (e.errMsg !== 'chooseImage:fail cancel') {
      console.error('Photo upload failed:', e)
      uni.showToast({ title: '图片上传失败', icon: 'none' })
    }
  } finally {
    photoUploading.value = false
  }
}

function removePhoto() {
  userPhoto.value = ''
  userPhotoPreview.value = ''
}

function previewPhoto() {
  if (userPhotoPreview.value) {
    uni.previewImage({ urls: [userPhotoPreview.value] })
  }
}

async function handleSubmit() {
  if (!form.value.brand.trim()) {
    uni.showToast({ title: '请填写品牌', icon: 'none' })
    return
  }
  if (!isSimpleType.value && !form.value.model.trim()) {
    uni.showToast({ title: '请填写型号', icon: 'none' })
    return
  }

  const equip = {
    type: form.value.type,
    brand: form.value.brand.trim(),
    model: form.value.model.trim(),
    price: form.value.price ? Number(form.value.price) : null,
    buyDate: form.value.buyDate || null,
    rating: form.value.rating,
    retired: form.value.retired,
    tag: form.value.tag.trim() || null,
    note: form.value.note.trim() || null,
    userPhoto: userPhoto.value || null,
  }

  if (isEditMode.value) {
    equip.id = editingId.value
    await store.update(editingId.value, equip)

    const purchaseExpenses = expenseStore.list.filter(e => e.equipId === editingId.value && e.category === 'equipment')
    if (purchaseExpenses.length > 0) {
      await expenseStore.update(purchaseExpenses[0].id, {
        amount: equip.price || 0,
        date: equip.buyDate || today,
        note: `购买 ${equip.brand} ${equip.model}`
      })
    }

    uni.showToast({ title: '更新成功', icon: 'success' })
  } else {
    equip.id = Date.now()
    await store.add(equip)

    if (equip.price) {
      await expenseStore.add({
        id: Date.now() + 1,
        date: equip.buyDate || today,
        amount: equip.price,
        category: 'equipment',
        equipId: equip.id,
        note: `购买 ${equip.brand} ${equip.model}`
      })
    }

    uni.showToast({ title: '添加成功', icon: 'success' })
  }

  setTimeout(() => {
    uni.navigateBack()
  }, 300)
}

async function handleDelete() {
  uni.showModal({
    title: '确认删除',
    content: '确认删除这件装备记录吗？此操作不可恢复。',
    success: async (res) => {
      if (res.confirm) {
        await store.remove(editingId.value)
        uni.showToast({ title: '删除成功', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 300)
      }
    }
  })
}
</script>

<template>
  <view class="page" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="page-header" >
      <navigator class="header-left" open-type="navigateBack" hover-class="header-left-hover">
        <image class="back-icon" src="/static/icons/back.svg" mode="aspectFit" />
      </navigator>
      <text class="page-title">{{ isEditMode ? '编辑装备' : '添加装备' }}</text>
      <view class="header-right">
        <image class="header-btn-icon" :class="{ disabled: !formValid }" src="/static/icons/save.svg" mode="aspectFit" @tap="handleSubmit" />
      </view>
    </view>

    <scroll-view scroll-y class="page-body">
      <!-- PHOTO -->
      <view class="form-section">
        <text class="form-label">装备照片</text>
        <view v-if="userPhotoPreview" class="photo-preview-wrap">
          <image class="photo-preview" :src="userPhotoPreview" mode="aspectFill" @tap="previewPhoto" />
          <view class="photo-remove" @tap="removePhoto">
            <text class="photo-remove-icon">✕</text>
          </view>
        </view>
        <view
          v-else
          class="photo-uploader"
          :class="{ uploading: photoUploading }"
          @tap="choosePhoto"
        >
          <text class="photo-uploader-icon">{{ photoUploading ? '...' : '＋' }}</text>
          <text class="photo-uploader-text">
            {{ photoUploading ? '上传中' : (userStore.isVIP ? '上传照片' : '完整版可上传照片') }}
          </text>
        </view>
      </view>

      <!-- TYPE -->
      <view class="form-section">
        <text class="form-label">类型 <text class="required">*</text></text>
        <view class="selector-trigger" @tap="openTypePicker">
          <view class="selector-value">
            <text
              v-if="form.type && typeIcon"
              class="iconfont"
              style="font-size:22px;color:#9ca3af"
            >{{ typeIcon }}</text>
            <text :class="form.type ? 'selector-text' : 'selector-placeholder'">
              {{ form.type ? getTypeLabel(form.type) : '选择类型' }}
            </text>
          </view>
          <text class="selector-arrow">▾</text>
        </view>
      </view>

      <template v-if="isSimpleType">
        <view class="form-section">
          <text class="form-label">品牌 <text class="required">*</text></text>
          <view class="form-input-wrap">
            <input
              class="form-input-inner"
              :value="form.brand"
              @input="e => form.brand = e.detail.value"
              placeholder="输入品牌"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>
        <view class="form-section">
          <text class="form-label">型号</text>
          <view class="form-input-wrap">
            <input
              class="form-input-inner"
              :value="form.model"
              @input="e => form.model = e.detail.value"
              placeholder="输入型号（可选）"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>
      </template>
      <template v-else>
        <view class="form-section">
          <text class="form-label">品牌 <text class="required">*</text></text>
          <view class="selector-trigger" @tap="openBrandPicker">
            <view class="selector-value">
              <text :class="form.brand ? 'selector-text' : 'selector-placeholder'">
                {{ form.brand ? getBrandDisplayName(form.brand) : '选择品牌' }}
              </text>
            </view>
            <text class="selector-arrow">▾</text>
          </view>
        </view>
        <view class="form-section">
          <text class="form-label">型号 <text class="required">*</text></text>
          <view class="selector-trigger" @tap="openModelPicker">
            <view class="selector-value">
              <text :class="form.model ? 'selector-text' : 'selector-placeholder'">
                {{ form.model ? getModelDisplayName(form.brand, form.model) : (form.brand ? '选择型号' : '请先选择品牌') }}
              </text>
            </view>
            <text class="selector-arrow">▾</text>
          </view>
        </view>
      </template>

      <!-- PRICE & DATE -->
      <view class="form-row">
        <view class="form-field">
          <text class="form-label">价格 (¥)</text>
          <view class="form-input-wrap">
            <input
              class="form-input-inner"
              :value="form.price"
              @input="e => form.price = e.detail.value"
              type="digit"
              placeholder="0"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>
        <view class="form-field">
          <text class="form-label">购买日期</text>
          <picker mode="date" :value="form.buyDate" :end="today" @change="handleDateChange">
            <view class="form-input-wrap date-input">
              <text :class="form.buyDate ? 'date-text' : 'input-placeholder'">
                {{ form.buyDate || '选择日期' }}
              </text>
              <uni-icons fontFamily="iconfont" :size="24" color="#9ca3af">&#xe65f;</uni-icons>
            </view>
          </picker>
        </view>
      </view>

      <!-- RATING -->
      <view class="form-section">
        <text class="form-label">评分 — {{ form.rating }}/10</text>
        <view class="rating-row">
          <view
            v-for="(filled, index) in ratingBlocks"
            :key="index"
            class="rating-block"
            :class="{ filled }"
            @tap="setRating(index)"
          ></view>
        </view>
      </view>

      <!-- STATUS -->
      <view class="form-section">
        <text class="form-label">状态</text>
        <view class="status-row">
          <view
            class="status-chip"
            :class="{ active: !form.retired }"
            @tap="setStatus(false)"
          >
            <text class="status-chip-text">✓ 使用中</text>
          </view>
          <view
            class="status-chip"
            :class="{ active: form.retired }"
            @tap="setStatus(true)"
          >
            <text class="status-chip-text">✕ 已退役</text>
          </view>
        </view>
      </view>

      <!-- TAG -->
      <view class="form-section">
        <text class="form-label">标签 (可选)</text>
        <view class="form-input-wrap">
          <input
            class="form-input-inner"
            :value="form.tag"
            @input="e => form.tag = e.detail.value"
            placeholder="例如：比赛用拍、礼物球鞋..."
            placeholder-class="input-placeholder"
          />
        </view>
      </view>

      <!-- NOTES -->
      <view class="form-section">
        <text class="form-label">备注与感受</text>
        <textarea
          class="form-textarea"
          :value="form.note"
          @input="e => form.note = e.detail.value"
          placeholder="用起来感觉如何？有什么故事吗？"
          placeholder-class="input-placeholder"
        />
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>

    <!-- Type Picker -->
    <view v-if="showTypePicker" class="picker-overlay" @tap.self="closeTypePicker">
      <view class="picker-panel" @tap.stop>
        <view class="picker-header">
          <text class="picker-title">选择类型</text>
          <view class="picker-close" @tap="closeTypePicker">
            <text class="picker-close-icon">✕</text>
          </view>
        </view>
        <scroll-view scroll-y class="picker-list">
          <view
            v-for="opt in typeOptions"
            :key="opt.key"
            class="picker-item"
            @tap="selectTypeFromPicker(opt)"
          >
            <uni-icons
              v-if="opt.key !== 'other' && EQUIP_TYPE_ICONS[opt.key]"
              fontFamily="iconfont"
              :size="22"
              color="#9ca3af"
            >{{ EQUIP_TYPE_ICONS[opt.key] }}</uni-icons>
            <text class="picker-item-text">{{ opt.label }}</text>
          </view>
          <view class="picker-list-spacer"></view>
        </scroll-view>
      </view>
    </view>

    <!-- Brand Picker -->
    <view v-if="showBrandPicker" class="picker-overlay" @tap.self="closeBrandPicker">
      <view class="picker-panel" @tap.stop>
        <view class="picker-header">
          <text class="picker-title">选择品牌</text>
          <view class="picker-close" @tap="closeBrandPicker">
            <text class="picker-close-icon">✕</text>
          </view>
        </view>
        <view class="picker-search">
          <input
            class="picker-search-input"
            v-model="brandSearchText"
            placeholder="搜索或输入自定义品牌..."
            placeholder-class="input-placeholder"
          />
        </view>
        <scroll-view scroll-y class="picker-list">
          <view
            v-for="brand in availableBrands"
            :key="brand.name"
            class="picker-item"
            @tap="selectBrand(brand)"
          >
            <image class="picker-item-logo" :src="brand.logo" mode="aspectFit" />
            <text class="picker-item-text">{{ getBrandDisplayName(brand.name) }}</text>
          </view>
          <view v-if="availableBrands.length === 0 && brandSearchText" class="picker-empty">
            <text class="picker-empty-text">未找到品牌</text>
          </view>
          <view class="picker-list-spacer"></view>
        </scroll-view>
        <view v-if="brandSearchText.trim()" class="picker-custom" @tap="useCustomBrand">
          <text class="picker-custom-text">+ 使用 "{{ brandSearchText.trim() }}" 作为自定义品牌</text>
        </view>
      </view>
    </view>

    <!-- Model Picker -->
    <view v-if="showModelPicker" class="picker-overlay" @tap.self="closeModelPicker">
      <view class="picker-panel" @tap.stop>
        <view class="picker-header">
          <text class="picker-title">选择型号</text>
          <view class="picker-close" @tap="closeModelPicker">
            <text class="picker-close-icon">✕</text>
          </view>
        </view>
        <view class="picker-search">
          <input
            class="picker-search-input"
            :value="modelSearchText"
            @input="e => modelSearchText = e.detail.value"
            placeholder="搜索或输入自定义型号..."
            placeholder-class="input-placeholder"
          />
        </view>
        <scroll-view scroll-y class="picker-list">
          <view
            v-for="model in availableModels"
            :key="model"
            class="picker-item"
            @tap="selectModel(model)"
          >
            <image
              class="picker-item-logo"
              :src="getBrandLogo(form.brand)"
              mode="aspectFit"
            />
            <text class="picker-item-text">{{ getModelDisplayName(form.brand, model) }}</text>
          </view>
          <view v-if="availableModels.length === 0 && !modelSearchText" class="picker-empty">
            <text class="picker-empty-text">{{ isCustomBrand ? '自定义品牌 — 请在下方输入型号' : '未找到型号' }}</text>
          </view>
          <view v-if="availableModels.length === 0 && modelSearchText" class="picker-empty">
            <text class="picker-empty-text">未找到型号</text>
          </view>
          <view class="picker-list-spacer"></view>
        </scroll-view>
        <view v-if="modelSearchText.trim()" class="picker-custom" @tap="useCustomModel">
          <text class="picker-custom-text">+ 使用 "{{ modelSearchText.trim() }}" 作为自定义型号</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #0f1117;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 80rpx 20rpx 10rpx 20rpx;
  flex-shrink: 0;
}
.header-left {
  display: flex;
  align-items: center;
  padding: 8rpx;
  flex-shrink: 0;
}
.back-icon {
  width: 40rpx;
  height: 40rpx;
  display: block;
}
.header-left-hover {
  opacity: 0.5;
}
.page-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-shrink: 0;
}

.header-btn-icon {
  width: 44rpx;
  height: 44rpx;
  display: block;
}
.header-btn-icon.disabled {
  opacity: 0.4;
}

.page-body {
  flex: 1;
  padding: 0 36rpx;
  box-sizing: border-box;
  width: 100%;
}

.form-section {
  margin-top: 36rpx;
}
.form-label {
  font-size: 22rpx;
  font-weight: 600;
  color: #6b7280;
  letter-spacing: 1rpx;
  margin-bottom: 16rpx;
  display: block;
}
.required {
  color: #ef4444;
}
.form-row {
  display: flex;
  gap: 24rpx;
  margin-top: 36rpx;
  width: 100%;
  box-sizing: border-box;
}
.form-field {
  flex: 1;
  min-width: 0;
}

.selector-trigger {
  background-color: #1e2430;
  border: 1rpx solid #2a3040;
  border-radius: 16rpx;
  padding: 20rpx 28rpx;
  box-sizing: border-box;
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.selector-value {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
  min-width: 0;
}
.selector-logo {
  width: 48rpx;
  height: 48rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.selector-text {
  font-size: 28rpx;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.selector-placeholder {
  font-size: 28rpx;
  color: #4b5563;
}
.selector-arrow {
  font-size: 24rpx;
  color: #6b7280;
  margin-left: 12rpx;
}

.form-input-wrap {
  background-color: #1e2430;
  border: 1rpx solid #2a3040;
  border-radius: 16rpx;
  padding: 20rpx 28rpx;
  box-sizing: border-box;
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
}
.form-input-inner {
  font-size: 28rpx;
  color: #ffffff;
  width: 100%;
  height: 100%;
}
.input-placeholder {
  color: #4b5563;
}
.date-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.date-text {
  font-size: 28rpx;
  color: #ffffff;
}


.rating-row {
  display: flex;
  gap: 12rpx;
}
.rating-block {
  flex: 1;
  height: 56rpx;
  border-radius: 10rpx;
  background-color: #1e2430;
}
.rating-block.filled {
  background-color: #C8FF1F;
}

.status-row {
  display: flex;
  gap: 20rpx;
}
.status-chip {
  flex: 1;
  padding: 22rpx 0;
  border-radius: 30rpx;
  border: 1rpx solid #2a3040;
  display: flex;
  align-items: center;
  justify-content: center;
}
.status-chip.active {
  background-color: rgba(200, 255, 31, 0.1);
  border-color: #C8FF1F;
}
.status-chip-text {
  font-size: 26rpx;
  color: #9ca3af;
}
.status-chip.active .status-chip-text {
  color: #C8FF1F;
}

.form-textarea {
  background-color: #1e2430;
  border: 1rpx solid #2a3040;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  font-size: 28rpx;
  color: #ffffff;
  margin-top: 16rpx;
  height: 160rpx;
  width: 100%;
  box-sizing: border-box;
}

.bottom-spacer {
  height: 200rpx;
}

/* Photo Upload */
.photo-preview-wrap {
  position: relative;
  width: 100%;
  height: 320rpx;
  border-radius: 16rpx;
  overflow: hidden;
}
.photo-preview {
  width: 100%;
  height: 100%;
}
.photo-remove {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 48rpx;
  height: 48rpx;
  border-radius: 24rpx;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
}
.photo-remove-icon {
  font-size: 24rpx;
  color: #ffffff;
}
.photo-uploader {
  width: 100%;
  height: 320rpx;
  border: 2rpx dashed #3a3f4a;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background-color: #1a1f2a;
}
.photo-uploader:active {
  background: rgba(255, 255, 255, 0.04);
}
.photo-uploader.uploading {
  opacity: 0.5;
}
.photo-uploader-icon {
  font-size: 56rpx;
  color: #4b5563;
}
.photo-uploader-text {
  font-size: 24rpx;
  color: #6b7280;
}

/* Picker Overlay */
.picker-overlay {
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
.picker-panel {
  background-color: #141820;
  border-radius: 40rpx 40rpx 0 0;
  height: 70%;
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
  background-color: #1e2430;
  display: flex;
  align-items: center;
  justify-content: center;
}
.picker-close-icon {
  font-size: 26rpx;
  color: #9ca3af;
}
.picker-search {
  padding: 0 36rpx 20rpx;
}
.picker-search-input {
  background-color: #1e2430;
  border: 1rpx solid #2a3040;
  border-radius: 16rpx;
  padding: 0.2rem 0.875rem;
  font-size: 28rpx;
  color: #ffffff;
  width: 100%;
  height: 2rem;
  box-sizing: border-box;
}
.picker-list {
  flex: 1;
  padding: 0 36rpx;
  min-height: 0;
}
.picker-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 20rpx;
  border-bottom: 1rpx solid #1e2430;
}
.picker-item:active {
  background-color: rgba(200, 255, 31, 0.05);
}
.picker-item-logo {
  width: 48rpx;
  height: 48rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.picker-item-text {
  font-size: 30rpx;
  color: #e4e4e7;
}
.picker-list-spacer {
  height: 200rpx;
}
.picker-empty {
  padding: 60rpx 0;
  display: flex;
  justify-content: center;
}
.picker-empty-text {
  font-size: 26rpx;
  color: #4b5563;
}
.picker-custom {
  padding: 28rpx 36rpx;
  border-top: 1rpx solid #1e2430;
  background-color: #141820;
}
.picker-custom:active {
  background-color: rgba(200, 255, 31, 0.05);
}
.picker-custom-text {
  font-size: 28rpx;
  color: #C8FF1F;
  font-weight: 500;
}
</style>
