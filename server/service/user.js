var wxService = require('./wx.js');
var collection = require('../models/collection.js');
var Users = collection.Users;
var Ids = collection.Ids;

/**
 * Use open id get User info. First get from database, then use weixin API.
 * @param {String} openid weixin open id
 * @returns {Object} User info
 */
exports.getUser = function(openid) {
  var user = Users.findOne({ openid: openid });
  if (user && user.nickname) {
    return user;
  }
  var userinfoData = wxService.getUserInfo(openid);
  if (user) {
    Users.update(user._id, {
      $set: {
        nickname: userinfoData.nickname,
        sex: userinfoData.sex,
        language: userinfoData.language,
        city: userinfoData.city,
        province: userinfoData.province,
        country: userinfoData.country,
        headimgurl: userinfoData.headimgurl
      }
    });
  } else {
    if (!Ids.findOne({name: 'user'})) {
      Ids.insert({name: 'user', id: 0});
    }
    var id = Ids.findOne({ 'name': 'user' });
    user = {};
    user.uid = id.id + 1;
    Ids.update({ 'name': 'user' }, { $inc: { id: 1 } });
    user.openid = openid;
    user.nickname = userinfoData.nickname;
    user.sex = userinfoData.sex;
    user.language = userinfoData.language;
    user.city = userinfoData.city;
    user.province = userinfoData.province;
    user.country = userinfoData.country;
    user.headimgurl = userinfoData.headimgurl;
    Users.insert(user);
  }
  user = Users.findOne({ openid: openid });
  return user;
};

/**
 * add simple user info.
 * @param  {String} openid openid from weixin
 * @returns {void}
 */
exports.addUser = function(openid) {
  if (!Ids.findOne({name: 'user'})) {
    Ids.insert({name: 'user', id: 0});
  }

  if (!Users.findOne({openid: openid})) {
    var user = {};
    var id = Ids.findOne({'name': 'user'});
    user.uid = id.id + 1;
    Ids.update({'name': 'user'}, {$inc: {id: 1}});
    user.openid = openid;
    Users.insert(user);
  }
};

/**
 * add follower to teacherId.
 * @param  {String} teacherId teacher openid from weixin
 * @param  {String} studentId student openid from weixin
 * @returns {void}
 */
exports.addFollower = function(teacherId, studentId) {
  Users.update({openid: teacherId}, {$push: {follower: studentId}});
};

/**
 * get user info by uid. it used in qrcode.
 * @param  {int} uid User.uid
 * @returns {Object} User Object
 */
exports.getUserInfoByUid = function(uid) {
  var user = Users.findOne({uid: uid});
  return exports.getUser(user.openid);
};

/**
 * check the follow relation.
 * @param  {String} teacherId teacher openid from weixin
 * @param  {String} studentId student openid from weixin
 * @returns {boolean} isFollowed
 */
exports.isFollowed = function(teacherId, studentId) {
  return !!Users.findOne({openid: teacherId, follower: studentId});
};

/**
 * get my followee.
 * @param  {String} openid user openid
 * @returns {Array} followee list
 */
exports.getFollowees = function(openid) {
  return Users.find({follower: openid}).fetch();
};
