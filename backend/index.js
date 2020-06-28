const Koa = require('koa');
const app = new Koa();
const cors = require('koa2-cors');
const bodyParser = require('koa-bodyparser');
const koajwt = require('koa-jwt');
const router = require('./router');
require('./config/db'); // 引入数据库
const sendHandle = require('./middlewares/sendHandle.js');
const errorHandle = require('./middlewares/errorHandle.js');

// jwt配置
const jwtSecretKey = 'my_todox'

// cors跨域
app.use(cors({
  credentials: true
}));

// body参数序列化
app.use(bodyParser());

// jwt错误处理
app.use(async (ctx, next) => {
  return await next().catch((err) => {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        msg: '请登录后操作！'
      };
    } else {
      throw err;
    }
  })
})

// koa-jwt中间件
app.use(koajwt({
  secret: jwtSecretKey
}).unless({
  path: [/\/regist/, /\/login/, /\/wxLogin/]
}));

// 全局response拦截
app.use(sendHandle());
app.use(errorHandle);

// 处理接口请求
router(app)

// 监听端口、启动程序
app.listen(3000, err => {
  if (err) throw new Error(err);
  console.log('runing at port 3000');
})