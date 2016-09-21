import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
var config = require("./config.js")

Meteor.startup(() => {
  // code to run on server at startup
    
  Router.route('/weixin', function () {
    var req = this.request;
    var res = this.response;
    var signature = this.params.query.signature;
    var timestamp = this.params.query.timestamp;
    var nonce = this.params.query.nonce;
    var echostr = this.params.query.echostr;
    var l = new Array();
    l[0] = nonce;
    l[1] = timestamp;
    l[2] = config.token;
    l.sort();
    var original = l.join('');
    var sha = CryptoJS.SHA1(original).toString();
    if (signature == sha) {
      res.end(echostr);
    } else {
      res.end("false");
    }
  }, {where: 'server'});

  Router.route('/setmenu', function () {
    var res = this.response;
    try {
      var token_url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + config.appID + "&secret=" + config.appsecret;
      var token_result = HTTP.get(token_url);
      var access_token = token_result.data.access_token;
      var menu_url = "https://api.weixin.qq.com/cgi-bin/menu/create?access_token=" + access_token;
      var menu_data = '{"button":[{"type":"view","name":"动态","url":"https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appID + '&redirect_uri=http%3A%2F%2F' + config.url + '%2Fnews&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect"},{ "type":"view","name":"课程","url":"https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appID + '&redirect_uri=http%3A%2F%2F' + config.url + '%2Fcourse&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect"},{"name":"更多","sub_button":[{"type":"view","name":"课程管理","url":"https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appID + '&redirect_uri=http%3A%2F%2F' + config.url + '%2Fcourse_manage&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect"},{"type":"view","name":"联系人","url":"https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appID + '&redirect_uri=http%3A%2F%2F' + config.url + '%2Fcontacts&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect"},{"type":"view","name":"发通知","url":"https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appID + '&redirect_uri=http%3A%2F%2F' + config.url + '%2Fnotice&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect"},{"type":"view","name":"我的名片","url":"https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appID + '&redirect_uri=http%3A%2F%2F' + config.url + '%2Finfo&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect"}]}]}';
      var menu_result = HTTP.post(menu_url,{content: menu_data});
      res.end("set success" + menu_result.content);
    } catch (err) {
      res.end("network error " + err);
    }
  }, {where: 'server'});
  

  Router.route('/info', function () {
    var req = this.request;
    var code = this.params.query.code;
    var res = this.response;
    try {
      var oauth2_url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + config.appID + '&secret=' + config.appsecret + '&code=' + code + '&grant_type=authorization_code';
      var oauth2_result = HTTP.get(oauth2_url);
      var oauth2_data = JSON.parse(oauth2_result.content);
      var openid = oauth2_data.openid;
      var access_token = oauth2_data.access_token;
      
      var userinfo_url = "https://api.weixin.qq.com/sns/userinfo?access_token=" + access_token + "&openid=" + openid;
      var userinfo_result = HTTP.get(userinfo_url);
      var userinfo_data = JSON.parse(userinfo_result.content);

      SSR.compileTemplate('info', Assets.getText('info.html'));
      Template.info.helpers({
        country: userinfo_data.country,
        province: userinfo_data.province,
        city: userinfo_data.city,
        nickname: userinfo_data.nickname,
        headimgurl: userinfo_data.headimgurl
      });
      var html = SSR.render("info");
      res.end(html);
    } catch (err) {
      console.log("network error " + err);
    }
  }, {where: 'server'});

  Router.route('/news', function () {
	//coding here
	var res = this.response;
	SSR.compileTemplate('news', Assets.getText('news.html'));
      Template.news.helpers({
        
      });
      var html = SSR.render("news");
      res.end(html);
  },{where: 'server'});
  Router.route('/course', function () {
	//coding here
	var res = this.response;
	SSR.compileTemplate('course', Assets.getText('course.html'));
      Template.course.helpers({
        
      });
      var html = SSR.render("course");
      res.end(html);
  },{where: 'server'});
  Router.route('/course_manage', function () {
	//coding here
	var res = this.response;
	SSR.compileTemplate('course_manage', Assets.getText('course_manage.html'));
      Template.course_manage.helpers({
        
      });
      var html = SSR.render("course_manage");
      res.end(html);
  },{where: 'server'});
  Router.route('/contacts', function () {
	//coding here
	var res = this.response;
	SSR.compileTemplate('contacts', Assets.getText('contacts.html'));
      Template.news.helpers({
        
      });
      var html = SSR.render("contacts");
      res.end(html);
  },{where: 'server'});
  Router.route('/notice', function () {
	//coding here
	var res = this.response;
	SSR.compileTemplate('notice', Assets.getText('notice.html'));
      Template.notice.helpers({
        
      });
      var html = SSR.render("notice");
      res.end(html);
  },{where: 'server'});
});