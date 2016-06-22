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
AppDevAuthenticate = require('./functions').AppDevAuthenticate;
DatabaseInit = require('./functions').DatabaseInit;
DatabaseClear = require('./functions').DatabaseClear;


router.get('/', function(req, res, next) {
	AppDevAuthenticate('manage', {title: 'Database Management'}, req, res);
});

router.get('/init', function(req,res,next){
	DatabaseInit('manage', {title: 'Database Management'}, req, res);
});

router.get('/clear', function(req,res,next){
	DatabaseClear('manage', {title: 'Database Management'}, req, res);
});

module.exports = router;