#kingke

## 开发准备

* [微信公众平台测试号](http://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login)
* 一台服务器（本人使用ubuntu 14.0 64位）
* [meteor文档](https://www.meteor.com/tutorials/blaze/creating-an-app)

## 搭建环境

### 安装meteor
```
curl https://install.meteor.com/ | sh
```

### 下载项目
```
git clone https://git.coding.net/mengning/kingke.git
cd kingke
```

### 修改配置文件
```
vim server/config.js
```

### 初次启动项目
```
meteor add jparker:crypto-sha1
meteor add iron:router
meteor add meteorhacks:ssr
meteor add http
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
PS:如果启动失败，你可以查看错误信息，网上搜索后解决，文末提供了一种解决办法

### 微信测试号进行设置
1. 接口配置信息
    * url:http://你的域名/weixin
    * token:你自己的密码
    * 点击**提交**，如果成功显示**配置成功**
2. 体验接口权限表-网页服务-网页帐号-网页授权获取用户基本信息-修改
    * url:你的域名
3. 访问http://你的域名/setmenu
    * 成功显示`set success{"errcode":0,"errmsg":"ok"}`
    * 如果与上方结果不同，根据errmsg查找系统bug
4. 取关并重新关注你的微信公众号，以刷新下方个人信息按钮
    * 成功则显示`来自 某国 某省 某市 的 某某某 您好`
    * 失败则根据页面提示查找bug

## 如果无法在80端口上启动meteor
PS：如果你成功在80端口上启动meteor，请跳过本段
使用一种叫做**nginx**的软件将http的80接口代理到meteor默认运行的3000接口上

### 安装nginx
```
sudo apt-get nginx
```

### 添加配置文件
添加配置文件
```
sudo touch /etc/nginx/conf.d/meteor.conf
sudo vim /etc/nginx/conf.d/meteor.conf
```

meteor.conf配置如下
```
server{
  listen 80;
  location / {
    proxy_pass http://localhost:3000/;
  }
}
```

查看nginx.conf配置文件，保证配置项`include /etc/nginx/conf.d/*.conf`前没有#号
```
sudo vim /etc/nginx/nginx.conf
```

### 重启nginx
```
sudo service nginx restart
```
