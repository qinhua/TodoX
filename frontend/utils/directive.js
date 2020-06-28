import Vue from 'vue'
Vue.directive('click-outside', {
	bind(el, binding, vnode) {
		function clickHandler(e) {
			// 这里判断点击的元素是否是本身，是本身，则返回
			if (el.contains(e.target)) {
				return false;
			}
			// 判断指令中是否绑定了函数
			if (binding.expression) {
				// 如果绑定了函数 则调用那个函数
				binding.value(e);
			}
		}
		// 给当前元素绑定个私有变量，方便在unbind中可以解除事件监听
		el.__vueClickOutside__ = clickHandler;
		document.addEventListener('click', clickHandler);
	},
	update() {},
	unbind(el, binding) {
		// 解除事件监听
		document.removeEventListener('click', el.__vueClickOutside__);
		delete el.__vueClickOutside__;
	}
})