import Vue from 'vue'
import App from './App'
Vue.config.productionTip = false
import Request from './static/js/request'
import './utils/prototype.js'
import './utils/directive.js'
Vue.prototype.$request = Request

App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
