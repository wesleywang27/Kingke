#kingke

基于[微信服务号API](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1445241432&token=&lang=zh_CN)和[Meteor](https://www.meteor.com/)开发课程管理SaaS平台kingke

## Requirements

* 用户作为教师可以创建和编辑课程（markdown格式）,创建课程时生成一个课程永久二维码（微信服务号带参数的二维码）
* 用户作为学生通过扫描教师分享的课程二维码加入该班级，学生可以查看自己的课程列表及课程资料
* 教师可以给某个班级所有学生发文字通知（微信服务号模板消息）
* 学生可以收到课程通知
* 用户（教师和学生）可以查看和编辑个人名片，个人名片中包含个人临时二维码（微信服务号带参数的二维码）
* 扫描用户个人二维码自动互加联系人，用户可以查看联系人列表
* 用户可以创建聊天群组，比如教师可以开启课程群，班级所有学生自动加入该群，新加入班级的学生也自动加入班级；用户也可以在联系人列表中选择其他用户创建聊天群组；聊天信息在服务器端存储。用户可以退出聊天群组。
* 课程内容及结构要求
  * 课程必须包含名称、简介（限制300字以内）及目录（即为章节标题的列表链接）；
  * 可以创建多个章节，每个章节都有一个标题和一个markdown格式的可编辑文档；

## QickStart

* 下载、安装、运行
```
//安装meteor,如果已经安装过了请忽略
curl https://install.meteor.com/ | sh
//下载kingke代码
git clone https://git.coding.net/mengning/kingke.git
//运行kingke
cd kingke
sudo meteor --port 80
```
* 申请[微信公众平台测试号](http://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login)
  * 接口配置url类似http://your.domain.name/weixin
  * 接口配置token自己定义,与项目配置文件server/config.js填写一致即可
  * 体验接口权限表-网页服务-网页帐号-网页授权获取用户基本信息-修改，只填写域名，比如your.domain.name
* 修改配置文件server/config.js
```
//Warning!!!
//Do Not Commit this file!!!
exports.token = "YOUR_TOKEN"; //自己定义,与申请测试号时填写一致即可
exports.appID = "YOUR_APPID"; 
exports.appsecret = "YOUR_APPSECRET";
exports.url = "YOUR_DOMAIN_NAME" //只填写域名，比如your.domain.name
```
* 通过访问http://your.domain.name/setmenu 设置菜单后，即可通过测试号demo项目功能
* 更多安装部署指南参考[INSTALL.md](https://coding.net/u/mengning/p/kingke/git/blob/master/INSTALL.md)


## Links

* [快速搭建基于meteor的微信公众号开发环境](https://coding.net/u/mengning/p/kingke/git/tree/v0.0.1)