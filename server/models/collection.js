// {
//   "_id": "tjuX66N6rQRhTmg7v",
//   "uid": 1,
//   "openid": "oRu2QuL7owXj1XrGW-KDW2HrlPdk",
//   "nickname": "棉花糖",
//   "sex": 1,
//   "language": "zh_CN",
//   "city": "南京",
//   "province": "江苏",
//   "country" : "中国",
//   "headimgurl": "http://wx.qlogo.cn/mmopen/zPYjyxqc33o1aefDJdbxk",
//   "follower": [ "oRu2QuL7owXj1XrGW-KDW2HrlPdk", "oRu2QuEu2Tf7dcfdwBdBtc20EzLY" ]
// }
exports.Users = new Mongo.Collection('Users');

// {
//   "_id": "uinHpYRdzgmwZG8Gj",
//   "name": "user",
//   "id": 5
// }
exports.Ids = new Mongo.Collection('Ids');

// {
//   "_id": "aFhWzgbNtxEgMK5dH",
//   "value": "Gs9KdBcsMNI61fWg79mC-KDca7ZBJ23bTDVwWvRyATbA3v0_Dd5oeHxb7uMFmdIM8cF2Dk_19jACASMJ",
//   "name": "access_token",
//   "time": 1476707466616
// }
exports.Wx = new Mongo.Collection('Wx');

// {
//   "_id": "CfMABhFTDmNZ5Disx",
//   "qid": 4,
//   "url": "http://mp.weixin.qq.com/cgi-bin/showqrcode",
//   "time": 1477302988266
// }
exports.QrCode = new Mongo.Collection('QrCode');

// {
//   "_id": "dcZuDMYCEc5Fuq27b",
//   "uid": 1,
//   "name": "需求工程",
//   "info": "# 4+1view",
//   "qrcodeid": 1000001
// }
exports.Courses = new Mongo.Collection('Courses');

// {
//   "_id": "JNuzF9sh2evW7YvRT",
//   "cid": "vXKZR4PbqtbLqfJpj",
//   "name": "软件工程简介",
//   "info": "1. 1111\r\n2. 22222\r\n3. 444444"
// }
exports.Chapters = new Mongo.Collection('Chapters');

// {
//   "_id": "JNjZr28ysAEwnrmBD",
//   "openid": "oRu2QuL7owXj1XrGW-KDW2HrlPdk",
//   "infoBegin": "周日休息",
//   "course": "高级软件工程",
//   "teacher": "孟宁",
//   "time": "10/15/2016 11:01:54 PM",
//   "infoEnd": "节日快乐"
// }
exports.News = new Mongo.Collection('News');
