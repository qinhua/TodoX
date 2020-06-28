const List = require('../models/list')
const User = require('../models/user')
const Utils = require('../middlewares/utils')

module.exports = {
  list: async (ctx, next) => {
    const req = ctx.request;
    const query = req.query;
    const userId = await Utils.getUserId(ctx);
    let param = {
      userId
    }
    query.status ? param.status = query.status : null;
    await List.find(param, {}, {
      sort: {
        'createTime': -1,
        'status': 1,
        'star': -1,
      }
    }, (err, data) => {
      if (!err) {
        ctx.send({
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
        }, '列表获取成功');
      } else {
        ctx.sendError('列表获取失败');
      }
    });
  },
  add: async (ctx, next) => {
    const req = ctx.request;
    const userId = await Utils.getUserId(ctx);
    const result = await List.create({
      content: req.body.content,
      status: 1,
      userId,
      createTime: Date.now()
    }, err => {
      console.log(err);
    })
    if (!result) {
      ctx.send(null, '添加成功');
    } else {
      ctx.sendError('添加失败');
    }
  },
  update: async (ctx, next) => {
    const req = ctx.request;
    const userId = await Utils.getUserId(ctx);
    const curUserData = await User.find({
      _id: userId
    }, err => {
      // console.log(err);
    })
    let param = {
      updateTime: Date.now()
    }
    req.body.content ? param.content = req.body.content : null;
    req.body.status ? param.status = req.body.status : null;
    if (req.body.star !== undefined) {
      param.star = req.body.star
      param.star && curUserData[0].topStar ? param.createTime = Date.now() : null
    }
    const result = await List.findByIdAndUpdate(req.body.id, param, {}, err => {
      console.log(err);
    })
    if (result) {
      ctx.send(null, '更新成功');
    } else {
      ctx.sendError('更新失败');
    }
  },
  delete: async (ctx, next) => {
    const req = ctx.request;
    const result = await List.deleteOne({
      _id: req.body.id
    }, err => {
      console.log(err);
    })
    if (result) {
      ctx.send(null, '删除成功');
    } else {
      ctx.sendError('删除失败');
    }
  }
}