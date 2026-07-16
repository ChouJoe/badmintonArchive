<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  readonly: { type: Boolean, default: false },
  max: { type: Number, default: 10 },
})

const emit = defineEmits(['update:modelValue'])

const blocks = computed(() => {
  return Array.from({ length: props.max }, (_, i) => i < props.modelValue)
})

function setRating(index) {
  if (props.readonly) return
  emit('update:modelValue', index + 1)
}
</script>

<template>
  <view class="rating-row" :class="{ readonly }">
    <view
      v-for="(filled, index) in blocks"
      :key="index"
      class="rating-block"
      :class="{ filled }"
      @tap="setRating(index)"
    ></view>
	<text class="rating-text">{{ props.modelValue }}/{{ props.max }}</text>
  </view>
</template>

<style scoped>
.rating-row {
  display: flex;
  gap: 8rpx;
  align-items: center;
}
.rating-block {
  width: 10rpx;
  height: 10rpx;
  flex: none;
  border-radius: 50%;
  background-color: #ffffff5c;
}
.rating-block.filled {
  background-color: #C8FF1F;
}
.rating-text{
	color: #C8FF1F;
}
</style>
