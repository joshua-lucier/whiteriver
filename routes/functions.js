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
var pgescape = require('pg-escape');
router.use(cookieParser(secret));
router.use(cookieSession({
  name: 'whiteriver',
  keys: [secret],
}));

module.exports = {

	Authorize: function(req,res,next,callback){
		if(req.body.username && req.body.password){//if coming from /login
			username = req.body.username;
			password = req.body.password;
		} else if (req.cookies.username && req.cookies.password){//if coming from other but already authenticated
			username = req.cookies.username;
			password = req.cookies.password;
		} else {  //not authenticated or coming from /login need to redirect to login
			res.cookie('url',req.originalUrl);
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
					if(result.results.errors)
					{
						console.log(result.results.errors[0].error[0]);
						error = {};
						error.stack = result.results.errors[0].error[0]['_'] + ' ID: ' + result.results.errors[0].error[0]['$'].id;
						error.status = result.results.errors[0].error[0]['_'] + ' ID: ' + result.results.errors[0].error[0]['$'].id;
						res.render('error',{title: 'Error', error: error});
						return;
					}
					console.log(result.results.authentication[0]['$'].message);
					if(result.results.authentication[0]['$'].code==0) 
					{
						res.cookie('username',username);
						res.cookie('password',password);
						callback(result,username);
					}
					else res.render('invalid',{title: 'title', message: result.results.authentication[0]['$'].message});
				});
			});
		});
		
		post_req.write(post_data);
		post_req.end();
	},

	Authenticate: this.Authorize,

	AdminAuthorize: function(req,res,next,callback){
		Authorize(req,res,next,function(auth,username){
			id = auth.results.authentication[0].member[0]['$'].id;
			var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
			admin = false;
			pg.connect(connectionString, function(err,client,done){
				if(err){
					return console.error('could not connect to postgres', err);
				}
				var query = client.query("select MemberID from Administrators where MemberID=" + id + ";");
				query.on('row', function(row){
					//console.log(row);
					if(row.memberid == id){
						admin = true;
					}
				});
				query.on('error', function(error){
					console.log(error);
					res.render('error', {title: 'Error'});
				});
				query.on('end', function(results){
					done();
					if(username == 'AppDev' || admin == true)
					{
						callback(auth);
					}
					else res.render('invalid',{title: 'title', message: result.results.authentication[0]['$'].message});
				});
			});
		});
	},

	AppDevAuthorize: function(req,res,next,callback)
	{
		Authorize(req,res,next,function(auth,username){
			if(auth.results.authentication[0]['$'].code==0 && username == 'AppDev'){
				callback(auth,username);
			}
			else res.render('invalid',{title: 'title', message: result.results.authentication[0]['$'].message});
		});
	},

	AdminAuthenticate: this.AdminAuthorize,

	AppDevAuthenticate: this.AppDevAuthorize,

	DatabaseInit: function(req,res,next){
		AppDevAuthorize(req,res,next,function(auth,username){
			var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
			pg.connect(connectionString, function(err,client,done){
				if(err){
					return console.error('could not connect to postgres', err);
				}
				client.query("create table Administrators(MemberID int PRIMARY KEY, AddedById int, DateTimeAdded timestamp not null default current_timestamp);");
				client.query("create table Alerts(AlertID serial primary key, AlertText text, AlertTime timestamp, AlertCreator int references Administrators(MemberID));");
				client.query("create table Tasks(TaskID serial primary key, CreatorID int references Administrators(MemberID), ChargedID int, Title text, Description text, TimeCreated timestamp not null default current_timestamp, TimeDue timestamp, RepeatPeriod varchar(5), RepeatIncrement int, RepeatEnd timestamp);");
				client.query("create table Trucks(TruckID serial primary key, TruckCreatorName text, TruckSerial text, TruckModel text, TruckMake text, TruckName text unique, TruckPlate text, DateCreated timestamp  not null default current_timestamp);");
				client.query("create table Runs(RunID serial primary key, TruckID int references Trucks(TruckID));");
				client.query("create table TruckStatusEntries(StatusEntryID serial primary key, RunID int references Runs(RunID), Status varchar(10), StatusTime timestamp not null default current_timestamp, MemberName text);");
				client.query("create table CallEntries(CallEntryID serial primary key, RunID int references Runs(RunID), CallType text, CallLocation text, CallDestination text, DriverName text, AdditionalNames text, RunNumber text);");
				done();
			});
		});
	},

	DatabaseClear: function(req,res,next){
		AppDevAuthorize(req,res,next,function(auth,username){	
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
			});
		});
	},

	AddTruck: function(req,res,next,callback){
		AdminAuthorize(req,res,next,function(auth,username){
			//add the truck to the database
			//first get the first and last name of the currently logged in user
			console.log('Setup post2 data');
			var post2_data = querystring.stringify({
				accid: accid,
				acckey: key,
				cmd: 'getMembers',
			});
			console.log('setup post2 options');
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
			console.log('setup post2 request');
			var post2_req = https.request(post2_options, function(post2_res){
				console.log('setup post2 response');
				post2_res.setEncoding('utf8');
				post2_res.on('data',function (chunk2){
					console.log('setup parse2');
					parseString(chunk2, function(err2, result2){
						creatorname = '';
						//console.log(result2.results.members[0].member[0]['$'].id);
						//console.log(result2.results.members[0].member[0].name[0]);
						//extract the name of the user from result2
						result2.results.members[0].member.forEach(function(item){
							if(item['$'].id==id) creatorname = item.name[0]; //if the id matches, get the name
						});
						//setup all the variables required
						TruckCreatorName = creatorname;
						TruckSerial = req.body.truckserial;
						TruckMake = req.body.truckmake;
						TruckModel = req.body.truckmodel;
						TruckName = req.body.truckname;
						TruckPlate = req.body.truckplate;
						pg.connect(connectionString, function(err3,client2,done2){
							console.log('connection complete');
							if(err3){
								console.error('could not connect to postgres', err);
							}
							var query2 = client2.query("insert into Trucks(TruckCreatorName,TruckSerial,TruckMake,TruckModel,TruckName,TruckPlate) values ($1,$2,$3,$4,$5,$6);",[TruckCreatorName,TruckSerial,TruckMake,TruckModel,TruckName,TruckPlate]);
							console.log('query complete');
							query2.on('end', function(results){
								done2();
								message = TruckCreatorName + " created truck " + TruckName;
								callback(message);
							});
							query2.on('error', function(error2){
								console.log(error2);
								res.render('error', {title: 'Error', error: error2});
							});
						});
						
					});
				});
			});
			post2_req.write(post2_data);
			post2_req.end();
		});
	},

	GetTrucks: function(req,res,next){
		AdminAuthorize(req,res,next,function(auth,username){
			//Get trucks from database as an object
			var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
			pg.connect(connectionString, function(err3,client2,done2){
				console.log('connection complete');
				trucks = [];
				if(err3){
					console.error('could not connect to postgres', err);
				}
				var query = client.query("select TruckName,TruckID from Trucks;");
				query.on('row', function(row2){
					//console.log(row);
					trucks.push(row2);
				});
				query.on('error', function(error2){
					console.log(error);
					res.render('error', {title: 'Error', error: error});
				});
				query.on('end', function(results2){
					done();
					console.log(trucks);
					finalhtml = '<form name="deleteTruck" action="/admin/deletetruckprompt" method="post">';
					trucks.forEach(function(item){
						finalhtml = finalhtml + '<div class="li"><input class="truckradio" type="radio" name="truckgroup" value="'+item.truckname+'"><a href="/admin/edittruckform?truckid='+item.truckid+'">' + item.truckname + '</a></input></div>';
					});
					finalhtml = finalhtml + '<input type="submit" value="Delete Truck"></input></form>';
					res.send(finalhtml);
				});
			});
		});
	},

	DeleteTruck: function(req,res,next,callback){
		pg.connect(connectionString, function(err2,client2,done2){
			if(err2){
				return console.error('could not connect to postgres', err2);
			}
			var query2 = client2.query("delete from Trucks where truckid=$1;",[req.body.truckid]);
			query2.on('row', function(row2){
				console.log(row);

			});
			query2.on('error', function(error2){
				console.log(error2);
				res.render('error', {title: 'Error'});
			});
			query2.on('end', function(results2){
				done();
				message = "Deleted truck with id "+req.body.truckid;
				callback(message);
			});
		});
	},

	EditTruck: function(page,data,req,res){
		AdminAuthorize(req,res,next,function(auth,username){
			pg.connect(connectionString, function(err2,client2,done2){
				if(err2){
					return console.error('could not connect to postgres', err2);
				}
				var query2 = client2.query("update Trucks set TruckName = $1, TruckSerial = $2, TruckMake = $3, TruckModel = $4, TruckPlate = $5 where TruckID = $6;",[req.body.truckname,req.body.truckserial,req.body.truckmake,req.body.truckmodel,req.body.truckplate,req.body.truckid]);
				query2.on('row', function(row2){
					console.log(row);

				});
				query2.on('error', function(error2){
					console.log(error2);
					res.render('error', {title: 'Error'});
				});
				query2.on('end', function(results2){
					message = 'Updated Truck Information';
					callback(message);
				});
			});
		});
	}
}