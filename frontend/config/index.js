export default {
	host: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://www.bbchin.com',
	codeMap: {
		0: '请求失败',
		200: '请求成功',
		401: '请登录后操作!'
	}
}
