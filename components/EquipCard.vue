<script setup>
import { computed, ref, onMounted } from 'vue'
import { getModelImageUrl, getBrandLogo, getBrandDisplayName, getModelDisplayName } from '@/utils/equipment-data'
import { useStringingStore } from '@/stores/stringing'
import { useGripStore } from '@/stores/grip'
import { useUserStore } from '@/stores/user'
import Rating from './Rating.vue'

const props = defineProps({
  item: { type: Object, required: true },
  typeLabels: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['click'])

const imgReady = ref(false)
const loadDone = ref(false)
const logoFailed = ref(false)
const hasModelImage = computed(() => !!getModelImageUrl(props.item.brand, props.item.model))
const hasBrandLogo = computed(() => !!getBrandLogo(props.item.brand))

const showModel = computed(() => imgReady.value)
const showDefaultBkg = computed(() => loadDone.value && !imgReady.value && (!hasBrandLogo.value || logoFailed.value))

function onImgLoad() {
  imgReady.value = true
  loadDone.value = true
}
function onImgError() {
  loadDone.value = true
}
function onLogoError() {
  logoFailed.value = true
}

onMounted(() => {
  if (!hasModelImage.value) {
    loadDone.value = true
  }
})

const userStore = useUserStore()
const stringingStore = useStringingStore()
const gripStore = useGripStore()

const LIFESPAN_DAYS = {
  racket: 1825,
  shoes: 365,
  bag: 1095,
  shuttle: 30,
  other: 1095
}

const STRINGING_LIFESPAN = 90
const GRIP_LIFESPAN = 60

function getLatestByDate(records) {
  if (!records || records.length === 0) return null
  return records.reduce((latest, r) => (!latest || r.date > latest.date ? r : latest), null)
}

const daysInUse = computed(() => {
  if (!props.item.buyDate) return null
  const buy = new Date(props.item.buyDate)
  const now = new Date()
  const diff = now - buy
  if (diff < 0) return 0
  return Math.floor(diff / 86400000)
})

const lifespanDays = computed(() => {
  return LIFESPAN_DAYS[props.item.type] || 1095
})

const lifespanPercent = computed(() => {
  if (daysInUse.value === null) return 0
  return Math.min(100, Math.round((daysInUse.value / lifespanDays.value) * 100))
})

const barColor = computed(() => {
  if (lifespanPercent.value >= 100) return '#ff000069'
  if (lifespanPercent.value >= 70) return '#ffa400ad'
  return '#C8FF1F'
})

const stringingRecords = computed(() => {
  if (props.item.type !== 'racket') return []
  return stringingStore.getByEquipId(props.item.id)
})

const gripRecords = computed(() => {
  if (props.item.type !== 'racket') return []
  return gripStore.getByEquipId(props.item.id)
})

const latestStringing = computed(() => getLatestByDate(stringingRecords.value))

const latestGrip = computed(() => getLatestByDate(gripRecords.value))

const stringingDaysSince = computed(() => {
  if (!latestStringing.value?.date) return null
  const d = new Date(latestStringing.value.date)
  const now = new Date()
  const diff = now - d
  return Math.floor(diff / 86400000)
})

const gripDaysSince = computed(() => {
  if (!latestGrip.value?.date) return null
  const d = new Date(latestGrip.value.date)
  const now = new Date()
  const diff = now - d
  return Math.floor(diff / 86400000)
})

const stringingPercent = computed(() => {
  if (stringingDaysSince.value === null) return null
  return Math.min(100, Math.round((stringingDaysSince.value / STRINGING_LIFESPAN) * 100))
})

const gripPercent = computed(() => {
  if (gripDaysSince.value === null) return null
  return Math.min(100, Math.round((gripDaysSince.value / GRIP_LIFESPAN) * 100))
})

const stringingBarColor = computed(() => {
  if (stringingPercent.value === null) return '#C8FF1F'
  if (stringingPercent.value >= 90) return '#ff0000d1'
  if (stringingPercent.value >= 80) return '#f5b912'
  return '#C8FF1F'
})

const gripBarColor = computed(() => {
  if (gripPercent.value === null) return '#C8FF1F'
  if (gripPercent.value >= 90) return '#ff0000d1'
  if (gripPercent.value >= 80) return '#f5b912'
  return '#C8FF1F'
})

function onClick() {
  emit('click', props.item)
}
</script>

<template>
  <view class="card" @tap="onClick">
    <image
      v-if="showModel"
      class="card-bg"
      :src="getModelImageUrl(item.brand, item.model)"
      mode="aspectFill"
    />
    <image
      v-else-if="hasBrandLogo && !showDefaultBkg"
      class="card-bg"
      :src="getBrandLogo(item.brand)"
      mode="aspectFit"
      @error="onLogoError"
    />
    <image
      v-if="hasModelImage && !loadDone"
      class="card-bg-preload"
      :src="getModelImageUrl(item.brand, item.model)"
      @load="onImgLoad"
      @error="onImgError"
    />
    <view class="card-overlay" :class="{ 'card-overlay-default': showDefaultBkg }"></view>
    <view class="card-content">
      <view class="card-top">
        <view class="card-info">
          <text class="card-name">{{ getBrandDisplayName(item.brand) }}</text>
        </view>
        <view class="card-type-badge">
          <uni-icons fontFamily="iconfont" :size="26" color="#ffffff87" >{{typeLabels[item.type]}}</uni-icons>
        </view>
      </view>
      <view class="card-mid">
        <text class="card-usage-label">已使用</text>
        <text class="card-usage-value">{{ daysInUse !== null ? `${daysInUse} 天` : '—' }}</text>
      </view>
      <view class="lifespan-bar-wrap" v-if="daysInUse !== null && userStore.isVIP">
        <text class="lifespan-bar-label">{{ item.type === 'racket' ? '球拍' : '装备' }}</text>
        <view class="lifespan-bar-bg">
          <view
            class="lifespan-bar-fill"
            :style="{ width: lifespanPercent + '%', backgroundColor: barColor }"
          ></view>
        </view>
        <text class="lifespan-bar-text">{{ lifespanPercent }}%</text>
      </view>

      <view class="lifespan-bar-wrap" v-if="stringingPercent !== null && userStore.isVIP">
        <text class="lifespan-bar-label">球线</text>
        <view class="lifespan-bar-bg">
          <view
            class="lifespan-bar-fill"
            :style="{ width: stringingPercent + '%', backgroundColor: stringingBarColor }"
          ></view>
        </view>
        <text class="lifespan-bar-text">{{ stringingPercent }}%</text>
      </view>

      <view class="lifespan-bar-wrap" v-if="gripPercent !== null && userStore.isVIP">
        <text class="lifespan-bar-label">手胶</text>
        <view class="lifespan-bar-bg">
          <view
            class="lifespan-bar-fill"
            :style="{ width: gripPercent + '%', backgroundColor: gripBarColor }"
          ></view>
        </view>
        <text class="lifespan-bar-text">{{ gripPercent }}%</text>
      </view>

      <view class="card-bottom">
		  <view class="card-bottom-left">
			  <text class="card-model" v-if="item.model">{{ getModelDisplayName(item.brand, item.model) }}</text>
			  <Rating :model-value="item.rating" readonly/>
		  </view>
		  <view class="card-bottom-right">
			  <text class="card-status" :class="{ retired: item.retired }">
			    {{ item.retired ? '已淘汰' : '使用中' }}
			  </text>
		  </view>
       
       
      </view>
    </view>
  </view>
</template>

<style scoped>
.card {
  position: relative;
  border-radius: 20rpx;
  overflow: hidden;
  min-height: 240rpx;
}
.card-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.card-bg-preload {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
}
.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 100%);
}
.card-overlay-default {
   background:
      /* Layer 3: 文字遮罩线性渐变 (顶层) */
      linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.55) 0%,
        rgba(0, 0, 0, 0.05) 40%,
        rgba(0, 0, 0, 0) 55%,
        rgba(0, 0, 0, 0.72) 80%,
        rgba(0, 0, 0, 0.88) 100%
      ),
      /* Layer 2: 左侧暖绿径向渐变 */
      radial-gradient(
        circle at 35% 60%,
        rgba(64, 97, 56, 0.35) 0%,
        rgba(38, 64, 38, 0) 100%
      ),
      /* Layer 1: 右上亮光径向渐变 */
      radial-gradient(
        circle at 75% 20%,
        rgba(51, 107, 82, 0.7) 0%,
        rgba(36, 71, 56, 0.28) 60%,
        rgba(26, 46, 36, 0) 100%
      ),
      /* Layer 0: 纯色底色 */
      #1F382E;
}
.card-content {
  position: relative;
  z-index: 1;
  padding: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 50rpx;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.card-info {
  margin-right: 16rpx;
  border-radius: 10px;
  background-color: rgba(255,255,255,0.15);
}
.card-name {
  font-size: 20rpx;
  font-weight: 700;
  color: #ffffff;
  display: block;
  padding:10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-date {
  font-size: 22rpx;
  color: rgba(255,255,255,0.6);
}
.card-type-badge {
  width: 52rpx;
  height: 52rpx;
  border-radius: 26rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-type-badge .iconfont {
  font-size: 32rpx;
  color: #ffffff;
}

.card-mid {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}
.card-usage-label {
  font-size: 22rpx;
  color: rgba(255,255,255,0.5);
}
.card-usage-value {
  font-size: 40rpx;
  font-weight: 800;
  color: #C8FF1F;
  letter-spacing: 1rpx;
}

.card-bottom {
  margin-top: 4rpx;
  display: flex;
  justify-content: space-between;
}
.card-bottom-left{
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.card-bottom-right{
	display: flex;
	align-items: end;
}
.card-model{
  font-size: 1rem;
  color: #fff;
  font-weight: 700;
}
.card-status {
  font-size: 24rpx;
  color: #4ade80;
  font-weight: 600;
  background: rgba(74, 222, 128, 0.15);
  padding: 4rpx 18rpx;
  border-radius: 20rpx;
}
.card-status.retired {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
}

.lifespan-bar-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.lifespan-bar-bg {
  flex: 1;
  height: 8rpx;
  background-color: rgba(255,255,255,0.1);
  border-radius: 4rpx;
  overflow: hidden;
}
.lifespan-bar-fill {
  height: 100%;
  border-radius: 4rpx;
  transition: width 0.3s;
}
.lifespan-bar-text {
  font-size: 20rpx;
  color: rgba(255,255,255,0.5);
  width: 72rpx;
  text-align: right;
  flex-shrink: 0;
}
.lifespan-bar-label {
  font-size: 18rpx;
  color: rgba(255,255,255,0.4);
  width: 40rpx;
  flex-shrink: 0;
}
</style>
