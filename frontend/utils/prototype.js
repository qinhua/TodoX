import Vue from 'vue'

Vue.prototype.$loading = {
	show(content) {
		uni.showLoading({
			title: content || '加载中'
		});
	},
	hide() {
		uni.hideLoading();
	}
}

Vue.prototype.$toast = (content, ico) => {
	uni.showToast({
		title: content || '',
		icon: ico || 'none'
	})
}

Vue.prototype.$checkLogin = function async () {
	let token = uni.getStorageSync('user-token')
	let curPage = getCurrentPages()[0].route
	// console.log(curPage)
	// console.log('user-token', token)
	if (curPage) {
		if (!token) {
			if (curPage.indexOf('/login') < 0) {
				uni.reLaunch({
					url: '/pages/login'
				})
			}
		} else {
			if (curPage.indexOf('/login') > -1) {
				uni.switchTab({
					url: '/pages/index'
				})
			}
		}
	}
}
