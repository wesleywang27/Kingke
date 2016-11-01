var collection = require('../models/collection.js');
var News = collection.News;

/**
 * add news.
 * @param  {String} openid User.openid
 * @param  {String} infoBegin begin info
 * @param  {String} course course name
 * @param  {String} teacher teacher name
 * @param  {String} time time
 * @param  {String} infoEnd end info
 * @returns {void}
 */
exports.saveNews = function(openid, infoBegin, course, teacher, time, infoEnd) {
  var news = {};
  news.openid = openid;
  news.infoBegin = infoBegin;
  news.course = course;
  news.teacher = teacher;
  news.time = time;
  news.infoEnd = infoEnd;
  News.insert(news);
};

/**
 * get user's news
 * @param  {String} openid User.openid
 * @returns {Array} news list
 */
exports.userNews = function(openid) {
  return News.find({ openid: openid }).fetch();
};
