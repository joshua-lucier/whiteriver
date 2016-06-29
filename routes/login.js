var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var express = require('express');
var querystring = require('querystring');
var https = require('https');
var router = express.Router();
var secret = process.env.secret;
var accid = process.env.accid;
var key = process.env.key;
var parseString = require('xml2js').parseString;
router.use(cookieParser(secret));
router.use(cookieSession({
  name: 'whiteriver',
  keys: [secret]
}));
Authenticate = require('./functions').Authenticate;
AppDevAuthenticate = require('./functions').AppDevAuthenticate;
AdminAuthenticate = require('./functions').AdminAuthenticate;
Authorize = require('./functions').Authorize;

router.post('/', function(req,res,next){
	Authorize(req,res,next,function(){
		res.redirect(req.cookies.url);
	});
});

router.post('/appdev', function(req,res,next){
	AppDevAuthorize(req,res,next,function(){
		res.render('manage',{title: 'Manage Database'});
	});
});

router.post('/admin', function(req,res,next){
	AdminAuthorize(req,res,next,function(auth){
		res.render('admin',{title: 'Admin'});
	});
});

module.exports = router;