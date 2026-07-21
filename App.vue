<script>
import { migrateIfNeeded } from '@/utils/migration'

export default {
  onLaunch: async function() {
    try {
      await migrateIfNeeded()
    } catch (e) {
      console.error('Migration error (non-fatal):', e)
    }
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  }
}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';
	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';
	@import '@/static/iconfont.css';
	// 设置整个项目的背景色
	page {
		background-color: #0f1117;
		font-family: sans-serif;
	}
	.uni-tabbar__label{
		font-family: sans-serif;
	}

	/* #endif */
</style>
