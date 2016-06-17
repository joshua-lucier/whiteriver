var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var express = require('express');
var querystring = require('querystring');
var https = require('https');
var fs = require('fs');
var router = express.Router();
var secret = process.env.secret;
var parseString = require('xml2js').parseString;
router.use(cookieParser(secret));
router.use(cookieSession({
  name: 'whiteriver',
  keys: [secret]
}));

function Authenticate(page, data, req, res){
	if(req.body.username && req.body.password){//if coming from /login
		username = req.body.username;
		password = req.body.password;
	} else if (req.cookies.username && req.cookies.password){//if coming from other but already authenticated
		username = req.cookies.username;
		password = req.cookies.password;
	} else {  //not authenticated or coming from /login need to redirect to login
		res.cookie('page',page);
		res.cookie('data',data);
		res.render('login',{title: 'Login'});
		return;
	}

	var post_data = querystring.stringify({
		accid: 'sys-wrva',
		acckey: 'C83EFC84310E49BC904425E04094F8947714D54ABB7B4FA2BFE1A7E26490DFA3',
		cmd: 'authenticateMember',
		memun: username,
		mempw: password
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
			/*console.log("username: " + username + " password: " + password);
			console.log("statusCode: " + post_res.statusCode);
			console.log("headers: " + post_res.headers);
			console.log('Response: ' + chunk);
			*/
			parseString(chunk, function(err, result){
				console.log(result.results.authentication[0]['$'].message);
				if(result.results.authentication[0]['$'].code==0) 
				{
					//login is successful
					//check for group
					var post2_data = querystring.stringify({
						accid: 'sys-wrva',
						acckey: 'C83EFC84310E49BC904425E04094F8947714D54ABB7B4FA2BFE1A7E26490DFA3',
						cmd: 'getAttributes',
					});
					var post2_options = {
						host: 'secure2.aladtec.com',
						port: 443,
						path: '/wrva/xmlapi.php',
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
							'Content-Length': Buffer.byteLength(post2_data)
						}
					}
					var post2_req = https.request(post2_options, function(post2_res){
						post2_res.setEncoding('utf8');
						post2_res.on('data',function (chunk2){
							parseString(chunk2, function(err2, result2){
								res.cookie('username',username);
								res.cookie('password',password);
								res.render(page,data);
							});
						});
					});
					post2_req.write(post2_data);
					post2_req.end();
				}
				else res.render('invalid',{title: 'title', message: result.results.authentication[0]['$'].message});
			});
		});
	});
	
	post_req.write(post_data);
	post_req.end();

}

router.post('/login', function(req,res,next){
	Authenticate(req.cookies.page,req.cookies.data,req,res);
});

/* GET home page.  This page selects which app your in. */
router.get('/', function(req, res, next) {
	Authenticate('index', {title: 'Home'}, req, res);
});

/*Main Page of the admin app*/
router.get('/admin', function(req, res, next){
	AdminAuthenticate('admin',{title: 'Admin'},req,res);
});

/*Main Page of the mobile app*/
router.get('/mobile', function(req,res,next){
	Authenticate('mobile', {title: 'mobile'}, req, res);
});

/*Main Page of the main display app*/
router.get('/main', function(req,res,next){
	Authenticate('main', {title: 'main'}, req, res);
});

router.get('/truck', function(req,res,next){
	truckid = req.query.truckid;
	truck = {}; //truck information from the database
	Render('truck', {title: 'Truck ' + truckid, truck: truck});
});

router.get('/test', function(req,res,next){

});

module.exports = router;
