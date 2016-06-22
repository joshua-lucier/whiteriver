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

router.get('/', function(req,res,next){
	truckid = req.query.truckid;
	truck = {}; //truck information from the database
	Authenticate('truck', {title: 'Truck ' + truckid, truck: truck});
});

module.exports = router;