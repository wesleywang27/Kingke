import { Meteor } from 'meteor/meteor';
var config = require('./config.js');
var wxService = require('./service/wx.js');
var courseService = require('./service/course.js');
var chapterService = require('./service/chapter.js');
var newsService = require('./service/news.js');
var userService = require('./service/user.js');
var marked = require('marked');
var check = [];

Meteor.startup(() => {
  if (Meteor.isServer) {
    // 修改iron:router,以满足xml请求
    Router.configureBodyParsers = function() {
      Router.onBeforeAction(Iron.Router.bodyParser.json());
      Router.onBeforeAction(Iron.Router.bodyParser.urlencoded({extended: false}));
      // Enable incoming XML requests for creditReferral route
      Router.onBeforeAction(
        Iron.Router.bodyParser.raw({
          type: '*/*',
          verify: function(req, res, body) {
            req.rawBody = body.toString();
          }
        }),
        {
          only: ['weixin'],
          where: 'server'
        }
      );
    };

    // 自动设置meteor菜单
    var setMenuResponse = wxService.setMenu();
    console.log(setMenuResponse);
  }

  Router.route('/weixin', {where: 'server'})
    .get(function() {
      var signature = this.params.query.signature;
      var timestamp = this.params.query.timestamp;
      var nonce = this.params.query.nonce;
      var echostr = this.params.query.echostr;
      var result = wxService.checkToken(nonce, timestamp, signature, echostr);
      var res = this.response;
      res.end(result);
    })
    .post(function() {
      var result = xml2js.parseStringSync(this.request.rawBody);
      var repeat = result.xml.FromUserName.join('') + result.xml.CreateTime.join('');
      var dothing = true;
      for (var x in check) {
        if (check[x] === repeat) {
          dothing = false;
          break;
        }
      }
      if (result.xml && dothing) {
        check.push(repeat);
        if (result.xml.Event[0] === 'subscribe') {
          userService.addUser(result.xml.FromUserName[0]);
          var student = userService.getUser(result.xml.FromUserName[0]);

          templateData = {
            text: {
              value: '\n欢迎' + student.nickname + '关注中科大课程信息平台——kingke公众号。\n为了您方便使用，请您尽快在个人中心进行身份验证。',
              color: '#173177'
            }
          };
          wxService.sendTemplate(student.openid, config.register_template_id, null, templateData);
        }
        if (result.xml.EventKey && result.xml.EventKey.join('') && (result.xml.Event[0] === 'subscribe' || result.xml.Event[0] === 'SCAN')) {
          var qrcodeid = result.xml.EventKey.join('');
          qrcodeid = qrcodeid.replace(/qrscene_/, '');
          qrcodeid = parseInt(qrcodeid, 10);
          var templateData;
          if (qrcodeid < 1000000) {
            var followid = qrcodeid;
            var teacher = userService.getUserInfoByUid(followid);
            var student = userService.getUser(result.xml.FromUserName[0]);

            templateData = {
              text: {
                value: '你已关注 ' + teacher.nickname,
                color: '#173177'
              }
            };
            wxService.sendTemplate(student.openid, config.follow_template_id, null, templateData);

            if (!userService.isFollowed(teacher.openid, student.openid)) {
              templateData = {
                text: {
                  value: '你已被 ' + student.nickname + ' 关注',
                  color: '#173177'
                }
              };
              wxService.sendTemplate(teacher.openid, config.follow_template_id, null, templateData);
              userService.addFollower(teacher.openid, student.openid);
            }
          } else {
            var course = courseService.courseInfoByQrcode(qrcodeid);

            templateData = {
              text: {
                value: '你已加入《' + course.name + '》课程',
                color: '#173177'
              }
            };
            student = userService.getUser(result.xml.FromUserName[0]);
            wxService.sendTemplate(
              student.openid,
              config.follow_template_id,
              config.url + '/course_info_student/' + course._id,
              templateData);

            if (!courseService.isChooseCourse(course._id, student.openid)) {
              courseService.chooseCourse(course._id, student.openid);
            }
          }
        }
      }
      this.response.end('');
    });

  Router.route('/setmenu', function() {
    var res = this.response;
    res.end(wxService.setMenu());
  }, {where: 'server'});

  Router.route('/info', function() {
    var code = this.params.query.code;
    var res = this.response;
    try {
      var userinfoData = wxService.oauth(code);
      var user = userService.getUser(userinfoData.openid);
      var qrcodeImg = wxService.qrcode(user.uid);
      SSR.compileTemplate('info', Assets.getText('info.html'));
      Template.info.helpers({
        country: userinfoData.country,
        province: userinfoData.province,
        city: userinfoData.city,
        nickname: userinfoData.nickname,
        headimgurl: userinfoData.headimgurl,
        qrcodeurl: qrcodeImg
      });
      var html = SSR.render('info');
      res.end(html);
    } catch (err) {
      console.log('network error ' + err);
    }
  }, {where: 'server'});

  Router.route('/notify', function() {
    var code = this.params.query.code;
    var userinfoData = wxService.oauth(code);
    var user = userService.getUser(userinfoData.openid);
    var courselist = courseService.teacherCourse(user.uid);
    var res = this.response;
    SSR.compileTemplate('notify', Assets.getText('notify.html'));
    Template.notify.helpers({
      uid: user.uid,
      courselist: courselist
    });
    var html = SSR.render('notify');
    res.end(html);
  }, {where: 'server'});

  Router.route('/notifyAns', function() {
    var req = this.request;
    var res = this.response;
    var infoBegin = req.body.infoBegin;
    var course = req.body.course;
    var teacher = req.body.teacher;
    var infoEnd = req.body.infoEnd;
    var nowDate = new Date();
    var time = nowDate.toLocaleDateString() + ' ' + nowDate.toLocaleTimeString();
    var openIds = [];
    var receive = req.body.receive;
    var url = '';
    if (receive && receive.search(/uid_/) >= 0) {
      receive = receive.replace(/uid_/, '');
      var user = userService.getUserInfoByUid(parseInt(receive, 10));
      openIds = user.follower;
    } else if (receive && receive.search(/cid_/) >= 0) {
      receive = receive.replace(/cid_/, '');
      var courseinfo = courseService.courseInfo(receive);
      openIds = courseinfo.student;
      url = config.url + '/course_info_student/' + courseinfo._id;
    }
    for (var x in openIds) {
      if (openIds.hasOwnProperty(x)) {
        var openId = openIds[x].replace(/^\s+|\s+$/g, '');
        if (!openId) {
          continue;
        }

        var templateData = {
          'first': {
            'value': infoBegin,
            'color': '#173177'
          },
          'keyword1': {
            'value': course,
            'color': '#173177'
          },
          'keyword2': {
            'value': teacher,
            'color': '#173177'
          },
          'keyword3': {
            'value': time,
            'color': '#173177'
          },
          'remark': {
            'value': infoEnd,
            'color': '#173177'
          }
        };
        var templateResult = wxService.sendTemplate(openId, config.notify_template_id, url, templateData);
        newsService.saveNews(openId, infoBegin, course, teacher, time, infoEnd);
        var infomation = templateResult.content;
        res.write(openId);
        res.write('\n');
        res.write(infomation);
        res.write('\n');
      }
    }
    res.end();
  }, {where: 'server'});

  Router.route('/news', function() {
    var code = this.params.query.code;
    var userinfoData = wxService.oauth(code);
    var newslist = newsService.userNews(userinfoData.openid);
    var res = this.response;
    SSR.compileTemplate('news', Assets.getText('news.html'));
    Template.news.helpers({
      newslist: newslist.reverse()
    });
    var html = SSR.render('news');
    res.end(html);
  }, {where: 'server'});

  Router.route('/course', function() {
    var code = this.params.query.code;
    var userinfoData = wxService.oauth(code);
    var courselist = courseService.studentCourse(userinfoData.openid);
    var res = this.response;
    SSR.compileTemplate('course', Assets.getText('course.html'));
    Template.course.helpers({
      courselist: courselist
    });
    var html = SSR.render('course');
    res.end(html);
  }, {where: 'server'});

  Router.route('/course_manage', function() {
    var code = this.params.query.code;
    var userinfoData = wxService.oauth(code);
    var userinfo = userService.getUser(userinfoData.openid);
    var courselist = courseService.teacherCourse(userinfo.uid);
    var res = this.response;
    SSR.compileTemplate('course_manage', Assets.getText('course_manage.html'));
    Template.course_manage.helpers({
      courselist: courselist,
      uid: userinfo.uid
    });
    var html = SSR.render('course_manage');
    res.end(html);
  }, {where: 'server'});

  Router.route('/course_add/:_uid', function() {
    var uid = this.params._uid;
    var res = this.response;
    SSR.compileTemplate('course_add', Assets.getText('course_add.html'));
    Template.course_add.helpers({
      uid: uid
    });
    var html = SSR.render('course_add');
    res.end(html);
  }, {where: 'server'});

  Router.route('/course_add_form', function() {
    var req = this.request;
    var uid = req.body.uid;
    var name = req.body.name;
    var info = req.body.info;
    courseService.saveCourse(parseInt(uid, 10), name, info);
    var res = this.response;
    res.end('创建成功！');
  }, {where: 'server'});

  Router.route('/chapter_add/:_cid', function() {
    var cid = this.params._cid;
    var res = this.response;
    SSR.compileTemplate('chapter_add', Assets.getText('chapter_add.html'));
    Template.chapter_add.helpers({
      cid: cid
    });
    var html = SSR.render('chapter_add');
    res.end(html);
  }, {where: 'server'});

  Router.route('/chapter_add_form', function() {
    var req = this.request;
    var cid = req.body.cid;
    var name = req.body.name;
    var info = req.body.info;
    chapterService.saveChapter(cid, name, info);

    var redirectUrl = 'http://' + config.url + '/course_info/' + cid;
    this.response.writeHead(302, {
      'Location': redirectUrl
    });
    this.response.end();
  }, {where: 'server'});

  Router.route('/course_info/:_id', function() {
    var id = this.params._id;
    var course = courseService.courseInfo(id);
    if (!course) {
      return;
    }
    var qrcodeurl = wxService.qrcode(course.qrcodeid);
    var chapterList = chapterService.courseChapters(course._id);
    var res = this.response;
    SSR.compileTemplate('course_info', Assets.getText('course_info.html'));
    Template.course_info.helpers({
      cid: course._id,
      chapterList: chapterList,
      qrcodeurl: qrcodeurl
    });
    var html = SSR.render('course_info');
    res.end(html);
  }, {where: 'server'});

  Router.route('/course_info_student/:_id', function() {
    var id = this.params._id;
    var course = courseService.courseInfo(id);
    if (!course) {
      return;
    }
    var qrcodeurl = wxService.qrcode(course.qrcodeid);
    var chapterList = chapterService.courseChapters(course._id);
    var res = this.response;
    SSR.compileTemplate('course_info_student', Assets.getText('course_info_student.html'));
    Template.course_info_student.helpers({
      cid: course._id,
      chapterList: chapterList,
      qrcodeurl: qrcodeurl
    });
    var html = SSR.render('course_info_student');
    res.end(html);
  }, {where: 'server'});

  Router.route('/chapter_info/:_id', function() {
    var id = this.params._id;
    var chapter = chapterService.chapterInfo(id);
    var res = this.response;
    SSR.compileTemplate('course_chapter_info', Assets.getText('course_chapter_info.html'));
    Template.course_chapter_info.helpers({
      info: marked(chapter.info)
    });
    var html = SSR.render('course_chapter_info');
    res.end(html);
  }, {where: 'server'});

  Router.route('/course_introduction/:_id', function() {
    var id = this.params._id;
    var course = courseService.courseInfo(id);
    var res = this.response;
    SSR.compileTemplate('course_chapter_info', Assets.getText('course_chapter_info.html'));
    Template.course_chapter_info.helpers({
      info: marked(course.info)
    });
    var html = SSR.render('course_chapter_info');
    res.end(html);
  }, {where: 'server'});

  Router.route('/contacts', function() {
    var res = this.response;
    var code = this.params.query.code;
    var userinfoData = wxService.oauth(code);
    var followeesId = userService.getFollowees(userinfoData.openid);
    var followees = [];
    for (var x in followeesId) {
      if (followeesId.hasOwnProperty(x)) {
        followees.push(userService.getUser(followeesId[x].openid));
      }
    }
    var followersId = userService.getUser(userinfoData.openid);
    var followers = [];
    for (var y in followersId.follower) {
      if (followersId.follower.hasOwnProperty(y)) {
        followers.push(userService.getUser(followersId.follower[y]));
      }
    }
    SSR.compileTemplate('contacts', Assets.getText('contacts.html'));
    Template.contacts.helpers({
      followees: followees,
      followers: followers
    });
    var html = SSR.render('contacts');
    res.end(html);
  }, {where: 'server'});
});
