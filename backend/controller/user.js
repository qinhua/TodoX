const User = require('../models/user')
const FeedBack = require('../models/feedback')
const jwt = require('jsonwebtoken')
const sha1 = require('sha1')
const request = require('koa2-request')
const Utils = require('../middlewares/utils')

// jwt配置
const jwtSecretKey = 'my_todox'
const jwtConfig = {
  expiresIn: '1d'
}

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
  ctx.send({
    token: jwtToken,
    user: {
      id: data['_id'],
      userName: data.userName,
      avatar: data.avatar,
      topStar: data.topStar,
      playSound: data.playSound,
      registTime: data.registTime,
      lastLoginTime: data.lastLoginTime,
      updateTime: data.updateTime
    }
  }, '登录成功');
}

module.exports = {
  regist: async (ctx, next) => {
    const req = ctx.request;
    const result = await User.find({
      userName: req.body.userName
    }, err => {
      console.log(err);
    })
    if (result.length) {
      ctx.sendError('用户已存在');
    } else {
      const result = await User.create({
        userName: req.body.userName,
        password: sha1(req.body.password),
        registTime: Date.now()
      }, err => {
        console.log(err);
      })
      if (!result) {
        ctx.send({
          token: jwtToken
        }, '注册成功');
      } else {
        ctx.sendError('注册失败');
      }
    }
  },
  login: async (ctx, next) => {
    const req = ctx.request;
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
        ctx.send({
          token: jwtToken,
          user: {
            id: result[0]['_id'],
            userName: result[0].userName,
            avatar: result[0].avatar,
            topStar: result[0].topStar,
            playSound: result[0].playSound,
            lastLoginTime: result[0].lastLoginTime
          }
        }, '登录成功');
        // 更新最后登录时间
        User.findByIdAndUpdate(result[0]['_id'], {
          lastLoginTime: Date.now()
        }, err => {
          console.log(err);
        })
      } else {
        ctx.sendError('密码错误');
      }
    } else {
      ctx.sendError('用户不存在');
    }
  },
  wxLogin: async (ctx, next) => {
    const req = ctx.request;
    let param = {
      appid: 'wx0b96ac338b02bebc',
      secret: '5474a0009a59eccd1ae274af06481d4c',
      js_code: req.body.js_code,
      grant_type: 'authorization_code'
    }
    let wxRes = await request('https://api.weixin.qq.com/sns/jscode2session' + Utils.urlEncode(param, 1));
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
            ctx.sendError('登录失败');
          }
        })
      })
    }
  },
  logout: async (ctx, next) => {
    try {
      ctx.send(null, '退出成功');
    } catch (e) {
      ctx.sendError('退出失败');
    }
  },
  userInfo: async (ctx, next) => {
    const userId = await Utils.getUserId(ctx);
    const result = await User.find({
      _id: userId
    }, err => {
      console.log(err);
    })
    if (result.length) {
      ctx.send({
        id: result[0]['_id'],
        userName: result[0].userName,
        avatar: result[0].avatar,
        topStar: result[0].topStar,
        playSound: result[0].playSound,
        registTime: result[0].registTime,
        lastLoginTime: result[0].lastLoginTime,
        updateTime: result[0].updateTime
      }, '获取用户信息成功');
    } else {
      ctx.sendError('获取用户信息失败');
    }
  },
  update: async (ctx, next) => {
    const req = ctx.request;
    const userId = await Utils.getUserId(ctx);
    // 首先检查用户名是否被其他用户占用
    const hasUser = await User.find({
      userName: req.body.userName
    }, err => {
      console.log(err);
    })
    if (hasUser.length && hasUser[0]['_id'] != userId) {
      ctx.sendError('用户名已被占用');
    } else {
      let param = {
        updateTime: Date.now()
      }
      req.body.userName ? param.userName = req.body.userName : null;
      req.body.avatar ? param.avatar = req.body.avatar : null;
      const result = await User.findByIdAndUpdate(userId, param, {}, err => {
        console.log(err);
      })
      if (result) {
        ctx.send(null, '更新成功');
      } else {
        ctx.sendError('更新失败');
      }
    }
  },
  setting: async (ctx, next) => {
    const req = ctx.request;
    const userId = await Utils.getUserId(ctx);
    let param = {
      topStar: req.body.topStar,
      playSound: req.body.playSound,
      updateTime: Date.now()
    }
    const result = await User.findByIdAndUpdate(userId, param, {}, err => {
      console.log(err);
    })
    if (result) {
      ctx.send(null, '修改成功');
    } else {
      ctx.sendError('修改失败');
    }
  },
  feedback: async (ctx, next) => {
    const req = ctx.request;
    const userId = await Utils.getUserId(ctx);
    const result = await FeedBack.create({
      userId,
      content: req.body.content,
      createTime: Date.now()
    }, err => {
      console.log(err);
    })
    if (!result) {
      ctx.send(null, '提交成功');
    } else {
      ctx.sendError('提交失败');
    }
  }
}