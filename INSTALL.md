#kingke

## 开发准备

* [微信公众平台测试号](mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login)
* 一台服务器（本人使用ubuntu 14.0 64位）
* [meteor文档](https://www.meteor.com/tutorials/blaze/creating-an-app)

## 搭建环境

### 安装meteor
```
curl https://install.meteor.com/ | sh
```

### 构建项目
```
meteor create simple-todos
cd simple-todos
meteor npm install
```

### 初次启动项目
```
meteor
```
此时你可以在`http://你服务器的ip地址:3000`上看到运行效果

### 为你的ip绑定域名
1. 因为微信官方为了安全需要，只有绑定域名的服务器才能提供微信后台服务，所以请自己为服务器绑定域名,或向老师寻求帮助。
2. 微信只允许80端口的网站做后台，所以默认的3000端口无法提供服务，使用如下命令修改服务端口。加sudo是因为在ubuntu上，小于1024的端口需要管理员身份进行绑定。
```
sudo meteor --port 80
```
此时你可以在`http://你的新域名`上看到运行效果

## 微信后台开发

### 新增meteor插件
为了完成后台的开发，新增三个插件，crypto-sha1、iron:router和meteorhacks:ssr
```
meteor add jparker:crypto-sha1
meteor add iron:router
meteor add meteorhacks:ssr
```
[sha1文档](https://atmospherejs.com/jparker/crypto-sha1)
[router文档](http://iron-meteor.github.io/iron-router/)
[ssr文档](https://atmospherejs.com/meteorhacks/ssr)

### 响应微信Token验证
1. 在微信测试号网页中，填写**接口配置信息**，URL为`http://你的新域名/weixin`，Token请自定义一个密码（仅有你自己知道）
2. 打开server/main.js进行修改，添加新路由"/weixin"
3. [微信接口文档-验证Token](http://mp.weixin.qq.com/wiki/index.php?title=%E6%B6%88%E6%81%AF%E6%8E%A5%E5%8F%A3%E6%8C%87%E5%8D%97)
```
  Router.route('/weixin', function () {
    var req = this.request;
    var res = this.response;
    //从发来的请求中提取四个参数
    var signature = this.params.query.signature;
    var timestamp = this.params.query.timestamp;
    var nonce = this.params.query.nonce;
    var echostr = this.params.query.echostr;
    //将其中两个参数和token按字典序排序
    var l = new Array();
    l[0] = nonce;
    l[1] = timestamp;
    l[2] = token;
    l.sort();
    //拼接为一个字符串
    var original = l.join('');
    //对字符串进行sha1加密处理
    var sha = CryptoJS.SHA1(original).toString();
    //判断与微信传来的signature是否相同
    if (signature == sha) {
      //相同则回传echostr，表示验证成功
      res.end(echostr);
    } else {
      res.end("false");
    }
  }, {where: 'server'});
```

### 设置微信自定义菜单
1. [微信官方文档-自定义菜单](http://mp.weixin.qq.com/wiki/index.php?title=%E8%87%AA%E5%AE%9A%E4%B9%89%E8%8F%9C%E5%8D%95%E5%88%9B%E5%BB%BA%E6%8E%A5%E5%8F%A3)
2. 依据微信文档开发如下
```
  Router.route('/setmenu', function () {
    var res = this.response;
    try {
      //获取接口调用凭据access_token
      var token_url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appID + "&secret=" + appsecret;
      var token_result = HTTP.get(token_url);
      var access_token = token_result.data.access_token;
      //使用微信自定义菜单创建接口
      var menu_url = "https://api.weixin.qq.com/cgi-bin/menu/create?access_token=" + access_token;
      var menu_data = '{"button":[{"type":"view","name":"查看个人信息","url":"https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appID + '&redirect_uri=http%3A%2F%2Fsa516170.mc2lab.com%2Finfo&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect"}]}';
      var menu_result = HTTP.post(menu_url, {content: menu_data});
      res.end("set success" + menu_result.content);
    } catch (err) {
      res.end("network error " + err);
    }
  }, {where: 'server'});
```
将以上代码发布到服务器后，访问网址`http://你的新域名/setmenu`，若界面显示set success，则表示成功

### 网页授权获取用户基本信息
在上一步中，我们将按钮的url设为了`https://open.weixin.qq.com/connect/oauth2/authorize?appid=appID&redirect_uri=http%3A%2F%2Fsa516170.mc2lab.com%2Finfo&response_type=code&scope=snsapi_userinfo&state=lc#wechat_redirect`
这是微信的网页授权认证所需要的网址，其中你应该在微信测试号上的，网页服务-网页账号-网页授权获取用户基本信息-修改，中添加自己的域名

然后在main.js中添加如下代码
```
  Router.route('/info', function () {
    var req = this.request;
    //获取微信统一身份验证传来的code
    var code = this.params.query.code;
    var res = this.response;
    try {
      //使用code获取用户openid和临时access_token
      var oauth2_url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + appID + '&secret=' + appsecret + '&code=' + code + '&grant_type=authorization_code';
      var oauth2_result = HTTP.get(oauth2_url);
      var oauth2_data = JSON.parse(oauth2_result.content);
      var openid = oauth2_data.openid;
      var access_token = oauth2_data.access_token;
      //使用用户信息查询接口
      var userinfo_url = "https://api.weixin.qq.com/sns/userinfo?access_token=" + access_token + "&openid=" + openid;
      var userinfo_result = HTTP.get(userinfo_url);
      var userinfo_data = JSON.parse(userinfo_result.content);
      //使用SSR插件获取info.html
      SSR.compileTemplate('info', Assets.getText('info.html'));
      //传用户data到页面中
      Template.info.helpers({
        country: userinfo_data.country,
        province: userinfo_data.province,
        city: userinfo_data.city,
        nickname: userinfo_data.nickname,
        headimgurl: userinfo_data.headimgurl
      });
      //将该模板返回页面
      var html = SSR.render("info");
      res.end(html);
    } catch (err) {
      console.log("network error " + err);
    }
  }, {where: 'server'});
```

## finish
以上为主要开发步骤，部分细节代码没有贴出，可以在git中查看其它文件。
