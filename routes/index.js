var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var express = require('express');
var querystring = require('querystring');
var https = require('https');
var router = express.Router();
var secret = process.env.secret;
var accid = process.env.accid;
var key = process.env.key;
var pgusername = process.env.pgusername;
var pgpassword = process.env.pgpassword;
var pghost = process.env.pghost;
var pgdatabase = process.env.pgdatabase;
var pg = require('pg');
var parseString = require('xml2js').parseString;
router.use(cookieParser(secret));
router.use(cookieSession({
  name: 'whiteriver',
  keys: [secret]
}));
Authorize = require('./functions').Authorize;

/* GET home page.  This page selects which app your in. */
router.get('/', function(req,res,next){
	Authorize(req,res,next,function(auth){
		res.render('index',{title: 'Home Page'});
	});
});

router.get('/test', function(req,res,next){
	/*
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
	*/
	var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err3,client2,done2){
			console.log('connection complete');
			entries = [];
			if(err3){
				console.error('could not connect to postgres', err);
			}
			var query2 = client2.query("select * from Runs;");
			query2.on('row', function(row2){
				//console.log(row);
				entries.push(row2);
			});
			query2.on('error', function(error2){
				error={};
				error.status = error2;
				error.stack = error2;
				res.render('error', {title: 'Error', error: error});
			});
			query2.on('end', function(results2){
				done2();
				console.log(entries);
				res.send(entries);
			});
		});
});

module.exports = router;
