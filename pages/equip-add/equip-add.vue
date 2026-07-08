<script setup>
import { ref, computed, watch } from 'vue'
import { addEquip } from '@/utils/storage'
import { getBrandsByType, getModelsByBrand, getBrandLogo, getModelImageUrl } from '@/utils/equipment-data'

const popup = ref(null)

const emit = defineEmits(['close', 'added'])

// Form state
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

// Selector states
const showBrandPicker = ref(false)
const showModelPicker = ref(false)
const brandSearchText = ref('')
const modelSearchText = ref('')
const isCustomBrand = ref(false)
const isCustomModel = ref(false)

const typeOptions = [
  { key: 'racket', label: 'Racket', icon: '🏸' },
  { key: 'shoes', label: 'Shoes', icon: '👟' },
  { key: 'bag', label: 'Bag', icon: '🎒' },
  { key: 'shuttle', label: 'Shuttle', icon: '🪶' },
  { key: 'other', label: 'Other', icon: '🧳' }
]

// Computed brand list based on type + search filter
const availableBrands = computed(() => {
  const brands = getBrandsByType(form.value.type)
  if (!brandSearchText.value) return brands
  const keyword = brandSearchText.value.toLowerCase()
  return brands.filter(b => b.name.toLowerCase().includes(keyword))
})

// Computed model list based on type + brand + search filter
const availableModels = computed(() => {
  if (!form.value.brand || isCustomBrand.value) return []
  const models = getModelsByBrand(form.value.type, form.value.brand)
  if (!modelSearchText.value) return models
  const keyword = modelSearchText.value.toLowerCase()
  return models.filter(m => m.toLowerCase().includes(keyword))
})

// Selected brand logo
const selectedBrandLogo = computed(() => {
  if (!form.value.brand || isCustomBrand.value) return null
  return getBrandLogo(form.value.brand)
})

// Model display image (product image → brand logo fallback)
const selectedModelImage = computed(() => {
  if (!form.value.brand || !form.value.model || isCustomModel.value) return selectedBrandLogo.value
  return getModelImageUrl(form.value.brand, form.value.model)
})

const ratingBlocks = computed(() => {
  return Array.from({ length: 10 }, (_, i) => i < form.value.rating)
})

const formValid = computed(() => {
  return form.value.brand.trim() !== '' && form.value.model.trim() !== ''
})

// Reset brand/model when type changes
watch(() => form.value.type, () => {
  form.value.brand = ''
  form.value.model = ''
  isCustomBrand.value = false
  isCustomModel.value = false
  brandSearchText.value = ''
  modelSearchText.value = ''
})

// Reset model when brand changes
watch(() => form.value.brand, () => {
  form.value.model = ''
  isCustomModel.value = false
  modelSearchText.value = ''
})

function selectType(key) {
  form.value.type = key
}

function setRating(index) {
  form.value.rating = index + 1
}

function setStatus(retired) {
  form.value.retired = retired
}

// Brand picker
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
}

function useCustomBrand() {
  if (brandSearchText.value.trim()) {
    form.value.brand = brandSearchText.value.trim()
    isCustomBrand.value = true
  }
  showBrandPicker.value = false
}

// Model picker
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

function open() {
  popup.value.open()
}

function close() {
  popup.value.close()
  showBrandPicker.value = false
  showModelPicker.value = false
  emit('close')
}

function handleDateChange(e) {
  form.value.buyDate = e.detail.value
}

function handleSubmit() {
  if (!form.value.brand.trim()) {
    uni.showToast({ title: '请填写品牌', icon: 'none' })
    return
  }
  if (!form.value.model.trim()) {
    uni.showToast({ title: '请填写型号', icon: 'none' })
    return
  }

  const equip = {
    id: Date.now(),
    type: form.value.type,
    brand: form.value.brand.trim(),
    model: form.value.model.trim(),
    price: form.value.price ? Number(form.value.price) : null,
    buyDate: form.value.buyDate || null,
    rating: form.value.rating,
    retired: form.value.retired,
    tag: form.value.tag.trim() || null,
    note: form.value.note.trim() || null,
    usage: '0'
  }

  addEquip(equip)
  uni.showToast({ title: '添加成功', icon: 'success' })

  // Reset form
  form.value = {
    type: 'racket',
    brand: '',
    model: '',
    price: '',
    buyDate: '',
    rating: 5,
    retired: false,
    tag: '',
    note: ''
  }
  isCustomBrand.value = false
  isCustomModel.value = false

  emit('added')
  close()
}

const today = new Date().toISOString().split('T')[0]

defineExpose({ open, close })
</script>

<template>
  <uni-popup ref="popup" type="bottom" :is-mask-click="true" @maskClick="close">
    <view class="panel">
      <!-- Drag indicator -->
      <view class="panel-indicator">
        <view class="panel-indicator-bar"></view>
      </view>

      <!-- Header -->
      <view class="panel-header">
        <view class="panel-close" @tap="close">
          <text class="panel-close-icon">✕</text>
        </view>
        <text class="panel-title">Add Equipment</text>
        <button class="panel-submit" :disabled="!formValid" @tap="handleSubmit">
          <text class="panel-submit-text">Add</text>
        </button>
      </view>

      <!-- Scrollable form content -->
      <scroll-view scroll-y class="panel-body">
        <!-- TYPE -->
        <view class="form-section">
          <text class="form-label">TYPE</text>
          <view class="type-grid">
            <view
              v-for="opt in typeOptions"
              :key="opt.key"
              class="type-chip"
              :class="{ active: form.type === opt.key }"
              @tap="selectType(opt.key)"
            >
              <text class="type-chip-icon">{{ opt.icon }}</text>
              <text class="type-chip-label">{{ opt.label }}</text>
            </view>
          </view>
        </view>

        <!-- BRAND -->
        <view class="form-section">
          <text class="form-label">BRAND <text class="required">*</text></text>
          <view class="selector-trigger" @tap="openBrandPicker">
            <view class="selector-value">
              <image
                v-if="selectedBrandLogo"
                class="selector-logo"
                :src="selectedBrandLogo"
                mode="aspectFit"
              />
              <text :class="form.brand ? 'selector-text' : 'selector-placeholder'">
                {{ form.brand || 'Select brand' }}
              </text>
            </view>
            <text class="selector-arrow">▾</text>
          </view>
        </view>

        <!-- MODEL -->
        <view class="form-section">
          <text class="form-label">MODEL <text class="required">*</text></text>
          <view class="selector-trigger" @tap="openModelPicker">
            <view class="selector-value">
              <image
                v-if="selectedModelImage && form.model && !isCustomModel"
                class="selector-logo"
                :src="selectedModelImage"
                mode="aspectFit"
              />
              <text :class="form.model ? 'selector-text' : 'selector-placeholder'">
                {{ form.model || (form.brand ? 'Select model' : 'Select brand first') }}
              </text>
            </view>
            <text class="selector-arrow">▾</text>
          </view>
        </view>

        <!-- PRICE & PURCHASE DATE -->
        <view class="form-row">
          <view class="form-field">
            <text class="form-label">PRICE (¥)</text>
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
            <text class="form-label">PURCHASE DATE</text>
            <picker mode="date" :value="form.buyDate" :end="today" @change="handleDateChange">
              <view class="form-input-wrap date-input">
                <text :class="form.buyDate ? 'date-text' : 'input-placeholder'">
                  {{ form.buyDate || 'Select date' }}
                </text>
                <text class="date-icon">📅</text>
              </view>
            </picker>
          </view>
        </view>

        <!-- RATING -->
        <view class="form-section">
          <text class="form-label">RATING — {{ form.rating }}/10</text>
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
          <text class="form-label">STATUS</text>
          <view class="status-row">
            <view
              class="status-chip"
              :class="{ active: !form.retired }"
              @tap="setStatus(false)"
            >
              <text class="status-chip-text">✓ In Use</text>
            </view>
            <view
              class="status-chip"
              :class="{ active: form.retired }"
              @tap="setStatus(true)"
            >
              <text class="status-chip-text">✕ Retired</text>
            </view>
          </view>
        </view>

        <!-- TAG -->
        <view class="form-section">
          <text class="form-label">TAG (OPTIONAL)</text>
          <view class="form-input-wrap">
            <input
              class="form-input-inner"
              :value="form.tag"
              @input="e => form.tag = e.detail.value"
              placeholder="e.g. First Match Racket, Gifted Shoes..."
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <!-- NOTES -->
        <view class="form-section">
          <text class="form-label">NOTES & FEELINGS</text>
          <textarea
            class="form-textarea"
            :value="form.note"
            @input="e => form.note = e.detail.value"
            placeholder="How does it feel? Any stories?"
            placeholder-class="input-placeholder"
          />
        </view>

        <view class="bottom-spacer"></view>
      </scroll-view>

      <!-- Brand Picker Overlay -->
      <view v-if="showBrandPicker" class="picker-overlay" @tap.self="closeBrandPicker">
        <view class="picker-panel">
          <view class="picker-header">
            <text class="picker-title">Select Brand</text>
            <view class="picker-close" @tap="closeBrandPicker">
              <text class="picker-close-icon">✕</text>
            </view>
          </view>
          <view class="picker-search">
            <input
              class="picker-search-input"
              :value="brandSearchText"
              @input="e => brandSearchText = e.detail.value"
              placeholder="Search or type custom brand..."
              placeholder-class="input-placeholder"
              :focus="showBrandPicker"
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
              <text class="picker-item-text">{{ brand.name }}</text>
            </view>
            <view v-if="availableBrands.length === 0 && brandSearchText" class="picker-empty">
              <text class="picker-empty-text">No brand found</text>
            </view>
            <view class="picker-list-spacer"></view>
          </scroll-view>
          <view v-if="brandSearchText.trim()" class="picker-custom" @tap="useCustomBrand">
            <text class="picker-custom-text">+ Use "{{ brandSearchText.trim() }}" as custom brand</text>
          </view>
        </view>
      </view>

      <!-- Model Picker Overlay -->
      <view v-if="showModelPicker" class="picker-overlay" @tap.self="closeModelPicker">
        <view class="picker-panel">
          <view class="picker-header">
            <text class="picker-title">Select Model</text>
            <view class="picker-close" @tap="closeModelPicker">
              <text class="picker-close-icon">✕</text>
            </view>
          </view>
          <view class="picker-search">
            <input
              class="picker-search-input"
              :value="modelSearchText"
              @input="e => modelSearchText = e.detail.value"
              placeholder="Search or type custom model..."
              placeholder-class="input-placeholder"
              :focus="showModelPicker"
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
                :src="getModelImageUrl(form.brand, model)"
                mode="aspectFit"
              />
              <text class="picker-item-text">{{ model }}</text>
            </view>
            <view v-if="availableModels.length === 0 && !modelSearchText" class="picker-empty">
              <text class="picker-empty-text">{{ isCustomBrand ? 'Custom brand — type model below' : 'No models found' }}</text>
            </view>
            <view v-if="availableModels.length === 0 && modelSearchText" class="picker-empty">
              <text class="picker-empty-text">No model found</text>
            </view>
            <view class="picker-list-spacer"></view>
          </scroll-view>
          <view v-if="modelSearchText.trim()" class="picker-custom" @tap="useCustomModel">
            <text class="picker-custom-text">+ Use "{{ modelSearchText.trim() }}" as custom model</text>
          </view>
        </view>
      </view>
    </view>
  </uni-popup>
</template>

<style scoped>
.panel {
  background-color: #141820;
  border-radius: 40rpx 40rpx 0 0;
  height: 85vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  font-family: sans-serif;
}
.panel *,
.panel *::before,
.panel *::after {
  box-sizing: border-box;
}

.panel-indicator {
  display: flex;
  justify-content: center;
  padding: 16rpx 0 8rpx;
}
.panel-indicator-bar {
  width: 60rpx;
  height: 8rpx;
  border-radius: 4rpx;
  background-color: #3a3f4a;
}

/* Header */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 36rpx 28rpx;
  border-bottom: 1rpx solid #1e2430;
}
.panel-close {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background-color: #1e2430;
  display: flex;
  align-items: center;
  justify-content: center;
}
.panel-close-icon {
  font-size: 28rpx;
  color: #9ca3af;
}
.panel-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
}
.panel-submit {
  background-color: #2a2f38;
  border-radius: 28rpx;
  padding: 12rpx 32rpx;
  margin: 0;
  border: none;
  outline: none;
  line-height: 1;
  display: flex;
  align-items: center;
}
.panel-submit[disabled] {
  opacity: 0.4;
  background-color: #2a2f38;
}
.panel-submit-text {
  font-size: 26rpx;
  color: #C8FF1F;
  font-weight: 600;
}

/* Body */
.panel-body {
  height: 70vh;
  padding: 0 36rpx;
  box-sizing: border-box;
  width: 100%;
}

/* Form common */
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

/* Selector trigger (brand/model) */
.selector-trigger {
  background-color: #1e2430;
  border: 1rpx solid #2a3040;
  border-radius: 16rpx;
  padding: 20rpx 28rpx;
  margin-top: 16rpx;
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

/* Input wrap */
.form-input-wrap {
  background-color: #1e2430;
  border: 1rpx solid #2a3040;
  border-radius: 16rpx;
  padding: 20rpx 28rpx;
  margin-top: 16rpx;
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
.date-icon {
  font-size: 28rpx;
}

/* Type chips */
.type-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 16rpx;
}
.type-chip {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 16rpx 28rpx;
  border-radius: 30rpx;
  border: 1rpx solid #2a3040;
  background-color: #1e2430;
}
.type-chip.active {
  background-color: rgba(200, 255, 31, 0.15);
  border-color: #C8FF1F;
}
.type-chip-icon {
  font-size: 26rpx;
}
.type-chip-label {
  font-size: 26rpx;
  color: #9ca3af;
}
.type-chip.active .type-chip-label {
  color: #C8FF1F;
}

/* Rating */
.rating-row {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
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

/* Status */
.status-row {
  display: flex;
  gap: 20rpx;
  margin-top: 16rpx;
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

/* Textarea */
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

/* ===== Picker Overlay ===== */
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

/* Search */
.picker-search {
  padding: 0 36rpx 20rpx;
}
.picker-search-input {
  background-color: #1e2430;
  border: 1rpx solid #2a3040;
  border-radius: 16rpx;
  padding: 20rpx 28rpx;
  font-size: 28rpx;
  color: #ffffff;
  width: 100%;
  box-sizing: border-box;
}

/* List */
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

/* Spacer inside picker list for bottom breathing room */
.picker-list-spacer {
  height: 60rpx;
}

/* Empty */
.picker-empty {
  padding: 60rpx 0;
  display: flex;
  justify-content: center;
}
.picker-empty-text {
  font-size: 26rpx;
  color: #4b5563;
}

/* Custom input option */
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
