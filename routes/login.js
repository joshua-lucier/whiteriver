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

router.post('/', function(req,res,next){
	Authenticate(req.cookies.page,req.cookies.data,req,res);
});

router.post('/appdev', function(req,res,next){
	AppDevAuthenticate(req.cookies.page,req.cookies.data,req,res);
});

router.post('/admin', function(req,res,next){
	AdminAuthenticate(req.cookies.page,req.cookies.data,req,res);
});

module.exports = router;