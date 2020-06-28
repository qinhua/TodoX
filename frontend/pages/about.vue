<template>
	<view class="p-about" @touchmove.prevent>
		<image class="logo" src="../static/img/todox.png"></image>
		<text class="title">TodoX V1.0.1</text>
		<text class="content">
			TodoX是一个极简的待办应用，h5和微信端皆可使用，支持最多30条待办，可对待办进行置顶、删除等操作。希望能帮助您更好的规划生活。
		</text>
	</view>
</template>

<script>
	export default {
		name: 'about',
		data() {
			return {}
		},
		onShow() {
			this.$checkLogin()
		}
	}
</script>

<style lang="scss">
	.p-about {
		box-sizing: border-box;
		padding: 50rpx;

		.logo {
			display: block;
			width: 160rpx;
			height: 160rpx;
			margin: 40rpx auto 14rpx;
			box-shadow: 1px 1px 8px 0 #ddd;
		}

		.title {
			display: block;
			margin-bottom: 40rpx;
			text-align: center;
			font-size: 26rpx;
			color: #999;
		}

		.content {
			padding: 30px 0;
			margin-bottom: 60rpx;
			line-height: 1.5;
			font-size: 28rpx;
			text-indent: 2em;
			color: #666;
		}
	}
</style>
