<template>
	<view class="p-feedback" @touchmove.prevent>
		<textarea spellcheck="false" maxlength="200" placeholder="请输入200字以内的内容…" v-model="param.content"></textarea>

		<button type="button" :disabed="loading" @click="submit">提 交</button>
	</view>
</template>

<script>
	export default {
		name: 'feedback',
		data() {
			return {
				loading: false,
				param: {
					content: ''
				}
			}
		},
		onShow() {
			this.$checkLogin()
		},
		methods: {
			submit() {
				if (this.loading) return false;
				if (!this.param.content.trim()) {
					this.$toast('请输入内容!')
					return false;
				}
				this.loading = true
				this.$loading.show('提交中…')
				this.$request({
					path: '/todo/feedback',
					method: 'POST',
					data: this.param,
				}).then(res => {
					this.loading = false
					this.$loading.hide()
					this.$toast('已收到您的宝贵建议')
					setTimeout(() => {
						uni.navigateBack({
							url: '/pages/profile'
						})
					}, 500)
				}).catch(err => {
					this.loading = false
					this.$loading.hide()
				})
			}
		}
	}
</script>

<style lang="scss">
	.p-feedback {
		box-sizing: border-box;
		padding: 50rpx;

		textarea {
			box-sizing: border-box;
			width: 100%;
			padding: 18rpx;
			margin-bottom: 24rpx;
			font-size: 28rpx;
			color: #666;
			border: 1px solid #ddd;
			border-radius: 5px;
		}

		button {
			height: 88rpx;
			line-height: 88rpx;
			margin-bottom: 20rpx;
			font-size: 28rpx;
			color: #fff;
			background: #40a0ea;
			border: none;
			border-radius: 5px;
		}
	}
</style>
