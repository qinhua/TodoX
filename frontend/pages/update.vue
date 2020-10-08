<template>
	<view class="p-update" :style="{height:wrapperHeight+'px'}" @touchmove.prevent>
		<view class="f-wrap">
			<view class="f-col">
				<text>用户名:</text>
				<input type="text" spellcheck="false" placeholder="请输入用户名" v-model.trim="param.userName">
			</view>
		</view>
		<view class="btn-wrap">
			<button type="button" :disabed="loading" @click="save">保 存</button>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'update',
		data() {
			return {
				loading: false,
				wrapperHeight: uni.getSystemInfoSync().windowHeight, //内容高度
				param: {
					userName: '',
					avatar: ''
				}
			}
		},
		onShow() {
			this.$checkLogin()
		},
		onLoad(option) {
			this.param.userName = decodeURIComponent(option.name||'')
		},
		methods: {
			save() {
				if (!this.param.userName) {
					this.$toast('用户名不能为空!')
					return false
				}
				this.loading = true
				this.$loading.show('保存中…')
				this.$request({
					path: '/api/todox/updateUser',
					method: 'POST',
					data: this.param
				}).then(res => {
					this.loading = false
					this.$loading.hide()
					uni.navigateBack({
						url: '/pages/profile'
					})
				}).catch(err => {
					this.loading = false
					this.$loading.hide()
				})
			}
		},
	}
</script>

<style lang="scss">
	.p-update {
		background: #f5f5f5;

		.f-wrap {
			box-sizing: border-box;
			padding: 30px;
			margin-bottom: 40rpx;
			background: #fff;
		}

		.btn-wrap {
			box-sizing: border-box;
			padding: 0 30px;
		}

		.f-col {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;

			text {
				float: left;
				text-align: right;
				font-size: 26rpx;
				margin-right: 10px;
			}

			input {
				flex: 1;
				height: 80rpx;
				padding: 0 24rpx;
				font-size: 26rpx;
				color: #666;
				border: 1px solid #ddd;
				border-radius: 5px;
			}
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
