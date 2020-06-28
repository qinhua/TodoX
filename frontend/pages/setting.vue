<template>
	<view class="p-setting" @touchmove.prevent>
		<view class="f-col">星标待办自动置顶
			<switch :checked="param.topStar" color="#40A0EA" @change="checkboxChange($event,'topStar')" />
		</view>
		<view class="f-col">完成时播放提示音
			<switch :checked="param.playSound" color="#40A0EA" @change="checkboxChange($event,'playSound')" />
		</view>
	</view>
</template>

<script>
	export default {
		name: 'setting',
		data() {
			return {
				loading: false,
				param: {
					topStar: false,
					playSound: false
				}
			}
		},
		onShow() {
			this.$checkLogin()
		},
		onLoad(option) {
			this.userInfo = uni.getStorageSync('user-info')
			this.param.topStar = this.userInfo.topStar
			this.param.playSound = this.userInfo.playSound
		},
		methods: {
			checkboxChange(e, type) {
				this.param[type] = e.target.value
				this.submit()
			},
			submit() {
				if (this.loading) return false;
				this.loading = true
				this.$request({
					path: '/api/setting',
					method: 'POST',
					data: this.param,
				}).then(res => {
					this.loading = false
					uni.setStorage({
						key: 'user-info',
						data: { ...this.userInfo,
							...this.param
						}
					});
				}).catch(err => {
					this.loading = false
				})
			}
		}
	}
</script>

<style lang="scss">
	.p-setting {
		box-sizing: border-box;
		padding: 30rpx 50rpx;

		.f-col {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 20rpx 0;
			text-align: left;
			font-size: 26rpx;
			color: #333;
			border-bottom: 1px solid #eee;
		}
	}
</style>
