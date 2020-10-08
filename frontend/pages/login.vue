<template>
	<view class="p-login" @touchmove.prevent>
		<!-- #ifdef H5 -->
		<view class="h5-login">
			<input type="text" spellcheck="false" maxlength="10" autocomplete="off" placeholder="请输入用户名" v-model.trim="param.userName">
			<input type="password" spellcheck="false" maxlength="20" autocomplete="off" placeholder="请输入密码" v-model.trim="param.password">
			<button type="button" :disabed="loading" class="btn-login" @click="login">登 录</button>
			<button type="button" :disabed="loading" class="btn-regist" @click="regist">注 册</button>
		</view>
		<!-- #endif -->
		<!-- #ifdef MP-WEIXIN -->
		<view class="wx-login" v-if="showWxLoginBtn">
			<button type="button" class="btn-login" open-type="getUserInfo" @getuserinfo="wxAuth" withCredentials="true">微信登录</button>
		</view>
		<!-- #endif -->
	</view>
</template>

<script>
	export default {
		name: 'login',
		data() {
			return {
				loading: false,
				mode: 1, //模式，1-登录，2-注册
				showWxLoginBtn: false,
				param: {
					userName: '',
					password: ''
				}
			}
		},
		async onShow() {
			await this.$checkLogin()
			// #ifdef MP-WEIXIN
			this.checkWxAuth()
			// #endif
		},
		methods: {
			// 检查是否已授权用户信息
			checkWxAuth() {
				let vm = this
				uni.getSetting({
					success(res) {
						if (res.authSetting['scope.userInfo']) {
							// 用户信息已授权，获取用户信息
							vm.wxAuth()
						} else if (!res.authSetting['scope.userInfo']) {
							// 用户信息未授权，需要点击按钮手动授权
							vm.showWxLoginBtn = true
						}
					},
					fail() {
						console.log("获取已授权选项失败")
					}
				})
			},
			// 授权用户信息
			wxAuth() {
				uni.getProvider({
					service: 'oauth',
					success: res => {
						if (~res.provider.indexOf('weixin')) {
							this.loading = true
							this.$loading.show('登录中…')
							uni.login({
								provider: 'weixin',
								success: loginRes => {
									// console.log(loginRes)
									this.getWxUserInfo(loginRes)
								},
								fail: err => {}
							})
						}
					}
				})
			},
			// 获取微信用户信息
			getWxUserInfo(authData) {
				let js_code = authData ? authData.code : ''; //js_code可以给后台获取unionID或openID作为用户标识
				// 获取用户信息
				uni.getUserInfo({
					provider: 'weixin',
					success: infoRes => {
						//infoRes里面有用户信息需要的话可以取一下
						// console.log(infoRes, 7989)
						let username = infoRes.userInfo.nickName; //用户名
						let avatar = infoRes.userInfo.avatarUrl; //用户头像
						let param = {
							userName: username,
							avatar,
							js_code
						};
						// 完成登录或注册
						this.$request({
							path: '/api/todox/wxLogin',
							method: 'POST',
							data: param,
						}).then(res => {
							if (authData) {
								this.loading = false
								this.$loading.hide()
							}
							uni.setStorageSync('user-token', res.data.token);
							uni.setStorage({
								key: 'user-info',
								data: res.data.user,
								success: function() {
									uni.switchTab({
										url: 'index'
									})
								}
							});
						}).catch(err => {
							if (authData) {
								this.loading = false
								this.$loading.hide()
							}
						})
					},
					fail: err => {
						console.log("获取用户信息失败")
					}
				})
			},
			// 表单验证
			validator() {
				if (!this.param.userName.trim()) {
					this.$toast('请输入用户名!')
					return false;
				}
				if (!this.param.password.trim()) {
					this.$toast('用户名不能为空!')
					return false;
				}
				return true;
			},
			// 登录
			login() {
				if (this.loading) return false;
				if (this.validator()) {
					this.loading = true
					this.$loading.show('登录中…')
					this.$request({
						path: '/api/todox/login',
						method: 'POST',
						data: this.param,
					}).then(res => {
						this.loading = false
						this.$loading.hide()
						uni.setStorageSync('user-token', res.data.token);
						uni.setStorage({
							key: 'user-info',
							data: res.data.user,
							success: function() {
								uni.switchTab({
									url: 'index'
								})
							}
						});
					}).catch(err => {
						this.loading = false
						this.$loading.hide()
					})
				}
			},
			// 注册
			regist() {
				if (this.validator()) {
					this.loading = true
					this.$loading.show('注册中…')
					this.$request({
						path: '/api/todox/regist',
						method: 'POST',
						data: this.param,
					}).then(res => {
						this.loading = false
						this.$loading.hide()
						this.$toast('注册成功,请直接登录!', 'success')
					}).catch(err => {
						this.loading = false
						this.$loading.hide()
					})
				}
			}
		}
	}
</script>

<style lang="scss">
	.p-login {
		box-sizing: border-box;
		padding: 30px;

		.title {
			padding: 30px 0;
			margin-bottom: 60rpx;
			text-align: center;
			font-weight: bold;
		}

		input {
			height: 88rpx;
			padding: 0 24rpx;
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
			color: #666;
			background: #fff;
			border: none;
			border-radius: 5px;
		}

		.btn-login {
			color: #fff;
			background: #40a0ea;
		}
	}
</style>
