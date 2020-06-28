import BaseConfig from '../../config'
const Request = (config) => {
	return new Promise((resolve, reject) => {
		let curPage = getCurrentPages()[0].route
		let conf = {
			url: BaseConfig.host,
			method: 'GET',
			data: {},
			withCredentials: true,
			header: {
				'authorization': 'Bearer ' + uni.getStorageSync('user-token')
			},
			success: (res) => {
				if (res.data.code === 200) {
					resolve(res.data)
				} else {
					if (res.data.code === 401 && curPage.indexOf('/login') < 0) {
						let msg = res.data.msg || BaseConfig.codeMap[res.data.code]
						// #ifdef H5
						uni.showToast({
							title: msg,
							icon: 'none',
						})
						// #endif
						uni.removeStorage({
							key: 'user-token',
							success: function() {
								// #ifdef MP-WEIXIN
								uni.reLaunch({
									url: '/pages/login'
								})
								// #endif
								// #ifdef H5
								setTimeout(() => {
									uni.reLaunch({
										url: '/pages/login'
									})
								}, 500)
								// #endif
							}
						})
						reject(msg)
					} else {
						let msg = res.data.msg || '出错了'
						uni.showToast({
							title: msg,
							icon: 'none'
						})
						reject(msg)
					}
				}
			},
			...config
		}
		conf.url += config.path
		conf.method.toUpperCase() == 'GET' ? conf.data._t = Date.now() : null
		uni.request(conf);
	})
}
export default Request;
