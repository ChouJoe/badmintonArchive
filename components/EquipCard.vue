<script setup>
import { computed, ref } from 'vue'
import { getModelImageUrl, getBrandLogo } from '@/utils/equipment-data'
import { useStringingStore } from '@/stores/stringing'
import { useGripStore } from '@/stores/grip'
import Rating from './Rating.vue'

const props = defineProps({
  item: { type: Object, required: true },
  typeLabels: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['click'])

const imgError = ref(false)

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

function getCardImage(item) {
  return getModelImageUrl(item.brand, item.model) || getBrandLogo(item.brand)
}

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
  if (lifespanPercent.value >= 100) return '#ef4444'
  if (lifespanPercent.value >= 70) return '#f59e0b'
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
  if (stringingPercent.value >= 100) return '#ef4444'
  if (stringingPercent.value >= 85) return '#f59e0b'
  if (stringingPercent.value >= 70) return '#f59e0b'
  return '#C8FF1F'
})

const gripBarColor = computed(() => {
  if (gripPercent.value === null) return '#C8FF1F'
  if (gripPercent.value >= 100) return '#ef4444'
  if (gripPercent.value >= 85) return '#f59e0b'
  if (gripPercent.value >= 70) return '#f59e0b'
  return '#C8FF1F'
})

function onClick() {
  emit('click', props.item)
}
</script>

<template>
  <view class="card" @tap="onClick">
    <image
      class="card-bg"
      :src="getCardImage(item)"
      mode="aspectFill"
      @error="imgError = true"
    />
    <view v-if="!imgError" class="card-overlay"></view>
    <view v-else class="card-bg-fallback"></view>
    <view class="card-content">
      <view class="card-top">
        <view class="card-info">
          <text class="card-name">{{ item.brand }}</text>
        </view>
        <view class="card-type-badge">
          <uni-icons fontFamily="iconfont" :size="26" color="#ffffff87" >{{typeLabels[item.type]}}</uni-icons>
        </view>
      </view>
      <view class="card-mid">
        <text class="card-usage-label">已使用</text>
        <text class="card-usage-value">{{ daysInUse !== null ? `${daysInUse} 天` : '—' }}</text>
      </view>
      <view class="lifespan-bar-wrap" v-if="daysInUse !== null">
        <text class="lifespan-bar-label">{{ item.type === 'racket' ? '球拍' : '装备' }}</text>
        <view class="lifespan-bar-bg">
          <view
            class="lifespan-bar-fill"
            :style="{ width: lifespanPercent + '%', backgroundColor: barColor }"
          ></view>
        </view>
        <text class="lifespan-bar-text">{{ lifespanPercent }}%</text>
      </view>

      <view class="lifespan-bar-wrap" v-if="stringingPercent !== null">
        <text class="lifespan-bar-label">球线</text>
        <view class="lifespan-bar-bg">
          <view
            class="lifespan-bar-fill"
            :style="{ width: stringingPercent + '%', backgroundColor: stringingBarColor }"
          ></view>
        </view>
        <text class="lifespan-bar-text">{{ stringingPercent }}%</text>
        <text v-if="stringingPercent >= 85" class="lifespan-bar-warn">⚠</text>
      </view>

      <view class="lifespan-bar-wrap" v-if="gripPercent !== null">
        <text class="lifespan-bar-label">手胶</text>
        <view class="lifespan-bar-bg">
          <view
            class="lifespan-bar-fill"
            :style="{ width: gripPercent + '%', backgroundColor: gripBarColor }"
          ></view>
        </view>
        <text class="lifespan-bar-text">{{ gripPercent }}%</text>
        <text v-if="gripPercent >= 85" class="lifespan-bar-warn">⚠</text>
      </view>

      <view class="card-bottom">
		  <view class="card-bottom-left">
			  <text class="card-model" v-if="item.model">{{ item.model }}</text>
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
.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 100%);
}
.card-bg-fallback {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #1e2430;
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
  width: 48rpx;
  text-align: right;
  flex-shrink: 0;
}
.lifespan-bar-label {
  font-size: 18rpx;
  color: rgba(255,255,255,0.4);
  width: 40rpx;
  flex-shrink: 0;
}
.lifespan-bar-warn {
  font-size: 20rpx;
  flex-shrink: 0;
}
</style>
