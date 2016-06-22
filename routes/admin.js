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
AdminAuthenticate = require('./functions').AdminAuthenticate;


/*Main Page of the admin app*/
router.get('/', function(req, res, next){
	AdminAuthenticate('admin',{title: 'Admin'},req,res);
});

module.exports = router;