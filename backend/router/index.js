const KoaRouter = require('koa-router')
const router = new KoaRouter({
  prefix: '/api/todox'
});
const UserController = require('../controller/user')
const ListController = require('../controller/list')

module.exports = (app) => {
  router.post('/regist', UserController.regist);
  router.post('/login', UserController.login);
  router.post('/wxLogin', UserController.wxLogin);
  router.get('/getUserInfo', UserController.userInfo);
  router.post('/updateUser', UserController.update);
  router.post('/setting', UserController.setting);
  router.post('/feedback', UserController.feedback);
  router.post('/logout', UserController.logout);
  router.get('/list', ListController.list);
  router.post('/add', ListController.add);
  router.post('/update', ListController.update);
  router.post('/delete', ListController.delete);
  router.post('/', async ctx => {
    ctx.body = '你好，我的世界';
  });
  app.use(router.routes())
    .use(router.allowedMethods())
};