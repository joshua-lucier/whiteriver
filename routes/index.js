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

/* GET home page.  This page selects which app your in. */
router.get('/', function(req, res, next) {
	Authenticate('index', {title: 'Home'}, req, res);
});

router.get('/test', function(req,res,next){
	var post_data = querystring.stringify({
		accid: accid,
		acckey: key,
		cmd: 'getSchedules',
		isp: 1
	});
	var post_options = {
		host: 'secure2.aladtec.com',
		port: 443,
		path: '/wrva/xmlapi.php',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(post_data)
		}
	}
	var post_req = https.request(post_options, function(post_res){
		post_res.setEncoding('utf8');
		post_res.on('data',function (chunk){
			parseString(chunk, function(err, result){
				console.log(result.results.schedules[0].schedule[0]);
				console.log(result.results.schedules[0].schedule[1]);
				console.log(result.results.schedules[0].schedule[2]);
			});
		});
	});
	post_req.write(post_data);
	post_req.end();
});

module.exports = router;
