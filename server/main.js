import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

Meteor.startup(() => {
  // code to run on server at startup

  var token = "lc504906985";
  var appID = "wx691c4f6cf06e6e0c";
  var appsecret = "b5291d1e3eb220cb65897b5f5986a742";
    
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
    l[2] = token;
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
      var token_url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appID + "&secret=" + appsecret;
      var token_result = HTTP.get(token_url);
      var access_token = token_result.data.access_token;
      var menu_url = "https://api.weixin.qq.com/cgi-bin/menu/create?access_token=" + access_token;
      var menu_data = '{"button":[{"type":"view","name":"查看个人信息","url":"https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appID + '&redirect_uri=http%3A%2F%2Fsa516170.mc2lab.com%2Finfo&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect"}]}';
      var menu_result = HTTP.post(menu_url, {content: menu_data});
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
      var oauth2_url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + appID + '&secret=' + appsecret + '&code=' + code + '&grant_type=authorization_code';
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
});
