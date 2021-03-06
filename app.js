var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');
var login = require('./routes/login');
var mobile = require('./routes/mobile');
var main = require('./routes/main');
var truck = require('./routes/truck');
var logout = require('./routes/logout');
var database = require('./routes/database');
var reports = require('./routes/reports');

var app = express();

var port = process.env.PORT || 3000
var secret = process.env.secret

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(secret));
app.use(cookieSession({
  name: 'whiteriver',
  keys: [secret]
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/admin', admin);
app.use('/login', login);
app.use('/mobile', mobile);
app.use('/main', main);
app.use('/truck', truck);
app.use('/logout', logout);
app.use('/database', database);
app.use('/reports',reports);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(port, function () {
  console.log('Example app listening on port ' + port);
});
module.exports = app;
