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

/*Main Page of the main display app*/
router.get('/', function(req,res,next){
	Authenticate('main', {title: 'main'}, req, res);
});

module.exports = router;