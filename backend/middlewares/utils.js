//直接从state中获取jwt解密后的用户信息
const getUserId = (ctx) => {
  return userId = ctx.state.user ? ctx.state.user.id : '';
}

// 对象转URl参数
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

module.exports = {
  getUserId,
  urlEncode
}