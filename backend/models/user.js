const mongoose = require('mongoose'); //引入mongoose
const Schema = mongoose.Schema; //将mongoose.Schema 赋值给变量
//创建Schema对象
/**
 * 定义一个模式(相当于传统意义的表结构)
 * 每个模式映射mongoDB的一个集合，
 * 它定义（只是定义，不是实现）这个集合里面文档的结构，就是定义这个文档有什么字段，字段类型是什么，字段默认值是什么等。
 * 除了定义结构外，还定义文档的实例方法，静态模型方法，复合索引，中间件等*/
const userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: false,
    default: '../static/img/avatar.jpg'
  },
  topStar: {
    type: Boolean,
    required: false,
    default: true
  },
  playSound: {
    type: Boolean,
    required: false,
    default: true
  },
  openid: String,
  registTime: Date,
  updateTime: Date,
  lastLoginTime: Date
});
/**
 * 定义模型
 * 模型用来实现我们定义的模式，调用mongoose.model来编译Schema得到Model
 * @type {[type]}
 */
const User = mongoose.model('user', userSchema);
module.exports = User;