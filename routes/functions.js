var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var express = require('express');
var querystring = require('querystring');
var https = require('https');
var secret = process.env.secret;
var accid = process.env.accid;
var key = process.env.key;
var pgusername = process.env.pgusername;
var pgpassword = process.env.pgpassword;
var pghost = process.env.pghost;
var pgdatabase = process.env.pgdatabase;
var parseString = require('xml2js').parseString;
var router = express.Router();
var pg = require('pg');
var Pool = pg.Pool;
var Client = pg.Client;
router.use(cookieParser(secret));
router.use(cookieSession({
  name: 'whiteriver',
  keys: [secret],
}));

module.exports = {

	Authenticate: function(page, data, req, res){
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
			accid: accid,
			acckey: key,
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
						res.cookie('username',username);
						res.cookie('password',password);
						res.render(page,data);
					}
					else res.render('invalid',{title: 'title', message: result.results.authentication[0]['$'].message});
				});
			});
		});
		
		post_req.write(post_data);
		post_req.end();

	},

	AdminAuthenticate: function(page,data,req,res){
		if(req.body.username && req.body.password){//if coming from /login
			username = req.body.username;
			password = req.body.password;
		} else if (req.cookies.username && req.cookies.password){//if coming from other but already authenticated
			username = req.cookies.username;
			password = req.cookies.password;
		} else {  //not authenticated or coming from /login need to redirect to login
			res.cookie('page',page);
			res.cookie('data',data);
			res.render('adminlogin',{title: 'Login'});
			return;
		}

		var post_data = querystring.stringify({
			accid: accid,
			acckey: key,
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
				parseString(chunk, function(err, result){
					console.log(result);
					admin = false;
					if((result.results.authentication[0]['$'].code==0 && (username == 'AppDev' || admin == true)) 
					{
						res.cookie('username',username);
						res.cookie('password',password);
						res.render(page,data);
					}
					else res.render('invalid',{title: 'title', message: result.results.authentication[0]['$'].message});
				});
			});
		});
		
		post_req.write(post_data);
		post_req.end();
	},

	AppDevAuthenticate: function(page, data, req, res){
		if(req.body.username && req.body.password){//if coming from /login
			username = req.body.username;
			password = req.body.password;
		} else if (req.cookies.username && req.cookies.password){//if coming from other but already authenticated
			username = req.cookies.username;
			password = req.cookies.password;
		} else {  //not authenticated or coming from /login need to redirect to login
			res.cookie('page',page);
			res.cookie('data',data);
			res.render('appdevlogin',{title: 'Login'});
			return;
		}

		var post_data = querystring.stringify({
			accid: accid,
			acckey: key,
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
					if(result.results.authentication[0]['$'].code==0 && username == 'AppDev') 
					{
						res.cookie('username',username);
						res.cookie('password',password);
						res.render(page,data);
					}
					else res.render('invalid',{title: 'title', message: result.results.authentication[0]['$'].message});
				});
			});
		});
		
		post_req.write(post_data);
		post_req.end();
	},

	DatabaseInit: function(page,data,req,res){
		if(req.body.username && req.body.password){//if coming from /login
			username = req.body.username;
			password = req.body.password;
		} else if (req.cookies.username && req.cookies.password){//if coming from other but already authenticated
			username = req.cookies.username;
			password = req.cookies.password;
		} else {  //not authenticated or coming from /login need to redirect to login
			res.cookie('page',page);
			res.cookie('data',data);
			res.render('appdevlogin',{title: 'Login'});
			return;
		}

		var post_data = querystring.stringify({
			accid: accid,
			acckey: key,
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
					if(result.results.authentication[0]['$'].code==0 && username == 'AppDev') 
					{
						
						var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
						pg.connect(connectionString, function(err,client,done){
							if(err){
								return console.error('could not connect to postgres', err);
							}
							client.query("create table Administrators(MemberID int PRIMARY KEY, AddedById int, DateTimeAdded timestamp);");
							client.query("create table Alerts(AlertID serial primary key, AlertText text, AlertTime timestamp, AlertCreator int references Administrators(MemberID));");
							client.query("create table Tasks(TaskID serial primary key, CreatorID int references Administrators(MemberID), ChargedID int, Title text, Description text, TimeCreated timestamp, TimeDue timestamp, RepeatPeriod varchar(5), RepeatIncrement int, RepeatEnd timestamp);");
							client.query("create table Trucks(TruckID serial primary key, TruckCreatorFirst text, TruckCreatorLast text, TruckSerial text, TruckModel text, TruckMake text, TruckName text, TruckPlate text, DateCreated timestamp);");
							client.query("create table Runs(RunID serial primary key, TruckID int references Trucks(TruckID));");
							client.query("create table TruckStatusEntries(StatusEntryID serial primary key, RunID int references Runs(RunID), Status varchar(10), StatusTime timestamp, MemberLast text, MemberFirst text);");
							client.query("create table CallEntries(CallEntryID serial primary key, RunID int references Runs(RunID), CallType text, CallLocation text, CallDestination text, DriverFirst text, DriverLast text, PrimaryFirst text, PrimaryLast text, AdditionalNames text, RunNumber text);");
							done();
							res.cookie('username',username);
							res.cookie('password',password);
							res.render(page,data);
						});

					}
					else res.render('invalid',{title: 'title', message: result.results.authentication[0]['$'].message});
				});
			});
		});
		
		post_req.write(post_data);
		post_req.end();
	},

	DatabaseClear: function(page,data,req,res){
		if(req.body.username && req.body.password){//if coming from /login
			username = req.body.username;
			password = req.body.password;
		} else if (req.cookies.username && req.cookies.password){//if coming from other but already authenticated
			username = req.cookies.username;
			password = req.cookies.password;
		} else {  //not authenticated or coming from /login need to redirect to login
			res.cookie('page',page);
			res.cookie('data',data);
			res.render('appdevlogin',{title: 'Login'});
			return;
		}

		var post_data = querystring.stringify({
			accid: accid,
			acckey: key,
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
					if(result.results.authentication[0]['$'].code==0 && username == 'AppDev') 
					{
						
						var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
						pg.connect(connectionString, function(err,client,done){
							if(err){
								return console.error('could not connect to postgres', err);
							}
							client.query("drop table CallEntries;");
							client.query("drop table TruckStatusEntries;");
							client.query("drop table Runs;");
							client.query("drop table Trucks;");
							client.query("drop table Tasks;");
							client.query("drop table Alerts;");
							client.query("drop table Administrators;");
							done();
							res.cookie('username',username);
							res.cookie('password',password);
							res.render(page,data);
						});

					}
					else res.render('invalid',{title: 'title', message: result.results.authentication[0]['$'].message});
				});
			});
		});
		
		post_req.write(post_data);
		post_req.end();
	}

}