<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getEquipById, addEquip, updateEquip } from '@/utils/storage'

const equipId = ref(null)
const isEdit = ref(false)

const brand = ref('')
const model = ref('')
const type = ref('racket')
const price = ref('')
const buyDate = ref('')
const usage = ref('')
const retired = ref(false)
const note = ref('')

const typeOptions = [
  { value: 'racket', label: '球拍' },
  { value: 'shoes', label: '球鞋' },
  { value: 'bag', label: '球包' },
  { value: 'other', label: '其他' }
]

onLoad((options) => {
  if (options.id) {
    equipId.value = Number(options.id)
    isEdit.value = true
    const data = getEquipById(equipId.value)
    if (data) {
      brand.value = data.brand || ''
      model.value = data.model || ''
      type.value = data.type || 'racket'
      price.value = data.price ? String(data.price) : ''
      buyDate.value = data.buyDate || ''
      usage.value = data.usage || ''
      retired.value = data.retired || false
      note.value = data.note || ''
    }
  }

  uni.setNavigationBarTitle({
    title: isEdit.value ? '编辑装备' : '添加装备'
  })
})

function validate() {
  if (!brand.value.trim()) {
    uni.showToast({ title: '请填写品牌', icon: 'none' })
    return false
  }
  if (!model.value.trim()) {
    uni.showToast({ title: '请填写型号', icon: 'none' })
    return false
  }
  if (!type.value) {
    uni.showToast({ title: '请选择类型', icon: 'none' })
    return false
  }
  if (price.value && (isNaN(Number(price.value)) || Number(price.value) <= 0)) {
    uni.showToast({ title: '价格须为正数', icon: 'none' })
    return false
  }
  return true
}

function handleSubmit() {
  if (!validate()) return

  const data = {
    brand: brand.value.trim(),
    model: model.value.trim(),
    type: type.value,
    price: price.value ? Number(price.value) : '',
    buyDate: buyDate.value,
    usage: usage.value,
    retired: retired.value,
    note: note.value.trim()
  }

  if (isEdit.value) {
    updateEquip(equipId.value, data)
    uni.showToast({ title: '更新成功', icon: 'success' })
  } else {
    data.id = Date.now()
    addEquip(data)
    uni.showToast({ title: '保存成功', icon: 'success' })
  }

  setTimeout(() => {
    uni.navigateBack()
  }, 500)
}

function onDateChange(e) {
  buyDate.value = e.detail.value
}

function onTypeChange(e) {
  type.value = typeOptions[e.detail.value].value
}
</script>

<template>
  <view class="container">
    <view class="form">
      <view class="form-item">
        <text class="form-label">品牌 <text class="required">*</text></text>
        <input class="form-input" v-model="brand" placeholder="如：Yonex" placeholder-style="color:#4a4a5a" />
      </view>

      <view class="form-item">
        <text class="form-label">型号 <text class="required">*</text></text>
        <input class="form-input" v-model="model" placeholder="如：Astrox 88D" placeholder-style="color:#4a4a5a" />
      </view>

      <view class="form-item">
        <text class="form-label">类型 <text class="required">*</text></text>
        <picker @change="onTypeChange" :value="typeOptions.findIndex(o => o.value === type)">
          <view class="form-input picker-value">{{ typeOptions.find(o => o.value === type)?.label || '请选择' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">价格</text>
        <input class="form-input" v-model="price" type="digit" placeholder="单位：元（选填）" placeholder-style="color:#4a4a5a" />
      </view>

      <view class="form-item">
        <text class="form-label">购买日期</text>
        <picker mode="date" @change="onDateChange" :value="buyDate" :end="new Date().toISOString().split('T')[0]">
          <view class="form-input picker-value">{{ buyDate || '请选择日期（选填）' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">使用时间</text>
        <input class="form-input" v-model="usage" type="digit" placeholder="单位：天（选填）" placeholder-style="color:#4a4a5a" />
      </view>

      <view class="form-item switch-item">
        <text class="form-label">使用状态</text>
        <view class="switch-value">
          <text>{{ retired ? '已淘汰' : '使用中' }}</text>
          <switch :checked="retired" @change="retired = $event.detail.value" color="#5b9bd5" />
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">备注</text>
        <textarea class="form-textarea" v-model="note" placeholder="记录个人感受或说明（选填）" placeholder-style="color:#4a4a5a" />
      </view>

      <view class="submit-btn" @tap="handleSubmit">
        <text>{{ isEdit ? '更新' : '保存' }}</text>
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
.form {
  background: #1a1d27;
  border-radius: 16rpx;
  padding: 30rpx;
}
.form-item {
  margin-bottom: 32rpx;
}
.form-label {
  display: block;
  font-size: 28rpx;
  color: #8b8b9e;
  margin-bottom: 12rpx;
  font-weight: 500;
}
.required {
  color: #f87171;
}
.form-input {
  height: 72rpx;
  border: 2rpx solid #2a2d3a;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #e4e4e7;
  display: block;
  background: #0f1117;
}
.picker-value {
  line-height: 72rpx;
}
.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.switch-item .form-label {
  margin-bottom: 0;
}
.switch-value {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.switch-value text {
  font-size: 28rpx;
  color: #e4e4e7;
}
.form-textarea {
  height: 160rpx;
  border: 2rpx solid #2a2d3a;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  font-size: 28rpx;
  color: #e4e4e7;
  display: block;
  background: #0f1117;
}
.submit-btn {
  margin-top: 60rpx;
  height: 88rpx;
  background: #5b9bd5;
  border-radius: 44rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
}
</style>
