var collection = require('../models/collection.js');
var Courses = collection.Courses;
var Ids = collection.Ids;

/**
 * save course.
 * @param  {int} uid User.uid
 * @param  {String} name course name
 * @param  {String} info course info
 * @returns {void}
 */
exports.saveCourse = function(uid, name, info) {
  var course = {};
  course.uid = uid;
  course.name = name;
  course.info = info;
  if (!Ids.findOne({ name: 'course' })) {
    Ids.insert({ name: 'course', id: 1000000 });
  }
  var id = Ids.findOne({ name: 'course' });
  course.qrcodeid = id.id + 1;
  Ids.update({ name: 'course' }, { $inc: { id: 1 } });
  Courses.insert(course);
};

/**
 * get teacher's all Courses.
 * @param  {int} uid User.uid
 * @returns {Array} course list
 */
exports.teacherCourse = function(uid) {
  return Courses.find({ uid: uid }).fetch();
};

/**
 * get student's all Courses.
 * @param  {String} openid User.openid
 * @returns {Array} course list
 */
exports.studentCourse = function(openid) {
  return Courses.find({ student: openid }).fetch();
};

/**
 * get course info.
 * @param  {String} id Courses._id
 * @returns {Object} course info
 */
exports.courseInfo = function(id) {
  return Courses.findOne({ _id: id });
};

/**
 * get course info by qrcode.
 * @param  {String} qrcodeid Courses.qrcodeid
 * @returns {Object} course info
 */
exports.courseInfoByQrcode = function(qrcodeid) {
  return Courses.findOne({qrcodeid: qrcodeid});
};

/**
 * check choose course.
 * @param  {String} courseId Courses._id
 * @param  {String} openid User.openid
 * @returns {boolean} isChooseCourse
 */
exports.isChooseCourse = function(courseId, openid) {
  return !!Courses.findOne({_id: courseId, student: openid});
};

/**
 * choose course.
 * @param  {String} courseId Courses._id
 * @param  {String} openid User.openid
 * @returns {void}
 */
exports.chooseCourse = function(courseId, openid) {
  Courses.update({_id: courseId}, {$push: {student: openid}});
};
