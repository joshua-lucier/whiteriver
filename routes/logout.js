var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var express = require('express');
var querystring = require('querystring');
var https = require('https');
var router = express.Router();
var secret = process.env.secret;
var accid = process.env.accid;
var key = process.env.key;
var url = process.env.url;
var parseString = require('xml2js').parseString;
router.use(cookieParser(secret));
router.use(cookieSession({
  name: 'whiteriver',
  keys: [secret]
}));
Authenticate = require('./functions').Authenticate;

router.get('/', function(req,res,next){
	res.clearCookie('username', {path: '/'});
	res.clearCookie('password', {path: '/'});
	res.clearCookie('page', {path: '/'});
	res.clearCookie('data', {path: '/'});
	res.render('login',{title: 'Login'});
});

module.exports = router;