import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http';

import './main.html';

Router.route('/', function () {
  this.render('Home');
});

Router.route('/notify', function () {
  this.render('Notify');
});

Router.route('/regit_student', function () {
  this.render('Regist_Student');
});
