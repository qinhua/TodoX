const Koa = require('koa');
const app = new Koa();
const mongoose = require('mongoose');
const cors = require('koa2-cors');
const bodyParser = require('koa-bodyparser');
const jwt = require('jsonwebtoken')
const koajwt = require('koa-jwt');
const request = require('koa2-request')
const sha1 = require('sha1')
const List = require('./models/list')
const User = require('./models/user')
require('./router')

// jwt配置
const jwtSecretKey = 'my_todox'
const jwtConfig = {
  expiresIn: '2h'
}
// 链接数据库一定放在koa前面
mongoose.set('useCreateIndex', true) //加上这个
mongoose.Promise = require('bluebird')
mongoose.connect('mongodb://127.0.0.1:27017', {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})

const urlEncode = (param, idx, key, encode) => {
  if (param == null) return '';
  var paramStr = '';
  var t = typeof (param);
  if (t == 'string' || t == 'number' || t == 'boolean') {
    var one_is = idx < 3 ? '?' : '&';
    paramStr += one_is + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param);
  } else {
    for (var i in param) {
      var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
      idx++
      paramStr += urlEncode(param[i], idx, k, encode);
    }
  }
  return paramStr;
};
// const omitPath = ['/api/login', '/api/regist', '/api/wxLogin']

// 微信登录成功
const handleWxLoginSuccess = async (ctx, data) => {
  // 生成token
  const jwtToken = jwt.sign({
    name: data.userName,
    id: data['_id']
  }, jwtSecretKey, jwtConfig);
  // 更新最后登录时间
  await User.findByIdAndUpdate(data['_id'], {
    lastLoginTime: Date.now()
  }, err => {
    console.log(err);
  })
  ctx.body = {
    code: 200,
    msg: '登录成功',
    data: {
      token: jwtToken
    }
  };
}

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
  path: [/(\/regist|\/login|\/wxLogin)/]
}));

// 处理请求
app.use(async (ctx, next) => {
  // ctx.body 即服务端响应的数据
  const req = ctx.request;
  // let res = ctx.response;
  const query = req.query;
  // let queryString = req.querystring;
  // console.log('userInfo', ctx.state.user);
  let xtoken = ctx.state.user ? ctx.state.user.id : ''; //直接从state中获取jwt解密后的结果
  // console.log('userId:', xtoken);
  if (req.url.indexOf('/list') > -1 && req.method === "GET") {
    let param = {
      userId: xtoken
    }
    query.status ? param.status = query.status : null;
    const result = await List.find(param, {}, {
      sort: {
        'createTime': -1,
        'status': 1,
        'star': -1,
      }
    }, (err, data) => {
      if (!err) {
        ctx.body = {
          code: 200,
          data: {
            list: data.map(cur => {
              return {
                id: cur['_id'],
                content: cur['content'],
                status: cur['status'],
                userId: cur['userId'],
                star: cur['star'],
                createTime: cur['createTime'],
                updateTime: cur['updateTime']
              }
            })
          }
        };
      } else {
        ctx.body = {
          code: 0,
          msg: err
        };
      }
    });
  }
  if (req.url === '/api/add' && req.method === "POST") {
    const result = await List.create({
      content: req.body.content,
      status: 1,
      userId: xtoken,
      createTime: Date.now()
    }, err => {
      console.log(err);
    })
    if (!result) {
      ctx.body = {
        code: 200,
        msg: '添加成功'
      };
    } else {
      ctx.body = {
        code: 0,
        msg: '添加失败'
      };
    }
  }
  if (req.url === '/api/update' && req.method === "POST") {
    let param = {
      updateTime: Date.now()
    }
    req.body.content ? param.content = req.body.content : null;
    req.body.status ? param.status = req.body.status : null;
    if (req.body.star !== undefined) {
      param.star = req.body.star
      param.createTime = Date.now()
    }
    const result = await List.findByIdAndUpdate(req.body.id, param, {}, err => {
      console.log(err);
    })
    if (result) {
      ctx.body = {
        code: 200,
        msg: '更新成功'
      };
    } else {
      ctx.body = {
        code: 0,
        msg: '更新失败'
      };
    }
  }
  if (req.url === '/api/delete' && req.method === "POST") {
    const result = await List.deleteOne({
      _id: req.body.id
    }, err => {
      console.log(err);
    })
    if (result) {
      ctx.body = {
        code: 200,
        msg: '删除成功'
      };
    } else {
      ctx.body = {
        code: 0,
        msg: '删除失败'
      };
    }
  }
  if (req.url === '/api/regist' && req.method === "POST") {
    const result = await User.find({
      userName: req.body.userName
    }, err => {
      console.log(err);
    })
    if (result.length) {
      ctx.body = {
        code: 0,
        msg: '用户已存在'
      };
    } else {
      const result = await User.create({
        userName: req.body.userName,
        password: sha1(req.body.password),
        registTime: Date.now()
      }, err => {
        console.log(err);
      })
      if (!result) {
        ctx.body = {
          code: 200,
          msg: '注册成功'
        };
      } else {
        ctx.body = {
          code: 0,
          msg: '注册失败'
        };
      }
    }
  }
  if (req.url === '/api/login' && req.method === "POST") {
    const result = await User.find({
      userName: req.body.userName
    }, err => {
      console.log(err);
    })
    if (result.length) {
      if (result[0].password === sha1(req.body.password)) {
        // 生成token
        const jwtToken = jwt.sign({
          name: result[0].userName,
          id: result[0]['_id']
        }, jwtSecretKey, jwtConfig);
        ctx.body = {
          code: 200,
          msg: '登录成功',
          data: {
            token: jwtToken
          }
        };
        // 更新最后登录时间
        User.findByIdAndUpdate(result[0]['_id'], {
          lastLoginTime: Date.now()
        }, err => {
          console.log(err);
        })
      } else {
        ctx.body = {
          code: 0,
          msg: '密码错误'
        };
      }
    } else {
      ctx.body = {
        code: 0,
        msg: '用户不存在'
      };
    }
  }
  if (req.url === '/api/wxLogin' && req.method === "POST") {
    let param = {
      appid: 'wx0b96ac338b02bebc',
      secret: '5474a0009a59eccd1ae274af06481d4c',
      js_code: req.body.js_code,
      grant_type: 'authorization_code'
    }
    query.status ? param.status = query.status : null;
    let wxRes = await request('https://api.weixin.qq.com/sns/jscode2session' + urlEncode(param, 1));
    //如果成功即可得到微信返回参数
    let wxData = JSON.parse(wxRes.body)
    // console.log(wxData);

    // 1.检查是否已经存在该用户
    const result1 = await User.find({
      openid: wxData.openid
    }, err => {
      // console.log(err);
    })

    if (result1.length) {
      // 2.存在用户,直接登录
      await handleWxLoginSuccess(ctx, result1[0])
    } else {
      // 2.不存在则创建用户,这里注意new Promise,不然返回404
      await new Promise((resolve, reject) => {
        User.create({
          userName: req.body.userName,
          password: 'wx_auth',
          openid: wxData.openid,
          avatar: req.body.avatar,
          registTime: Date.now()
        }, async (err, data) => {
          if (!err) {
            await handleWxLoginSuccess(ctx, data)
            resolve(data)
          } else {
            ctx.body = {
              code: 0,
              msg: '登录失败'
            };
          }
        })
      })
    }
  }
  if (req.url.indexOf('/getUserInfo') > -1 && req.method === "GET") {
    const result = await User.find({
      _id: xtoken
    }, err => {
      console.log(err);
    })
    if (result.length) {
      ctx.body = {
        code: 200,
        msg: '获取用户信息成功',
        data: result[0]
      };
    } else {
      ctx.body = {
        code: 0,
        msg: '获取用户信息失败'
      };
    }
  }
  if (req.url === '/api/updateUser' && req.method === "POST") {
    // 首先检查用户名是否被占用
    const hasUser = await User.find({
      userName: req.body.userName
    }, err => {
      console.log(err);
    })
    if (hasUser.length) {
      ctx.body = {
        code: 0,
        msg: '用户名已存在!'
      };
    } else {
      let param = {
        updateTime: Date.now()
      }
      req.body.userName ? param.userName = req.body.userName : null;
      req.body.avatar ? param.avatar = req.body.avatar : null;
      const result = await User.findByIdAndUpdate(xtoken, param, {}, err => {
        console.log(err);
      })
      if (result) {
        ctx.body = {
          code: 200,
          msg: '更新成功'
        };
      } else {
        ctx.body = {
          code: 0,
          msg: '更新失败'
        };
      }
    }
  }
  if (req.url === '/api/logout' && req.method === "POST") {
    try {
      ctx.body = {
        code: 200,
        msg: '退出成功'
      };
    } catch (e) {
      ctx.body = {
        code: 0,
        msg: '退出失败'
      };
    }
  }
  if (req.url === '/') {
    ctx.body = '你好，我的世界';
  }
})

// 监听端口、启动程序
app.listen(3000, err => {
  if (err) throw new Error(err);
  console.log('runing at port 3000');
})