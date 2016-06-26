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
var NodeRSA = require('node-rsa');
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
						id = result.results.authentication[0].member[0]['$'].id;
						res.cookie('username',username);
						res.cookie('password',password);
						callback(id,username);
					}
					else res.render('invalid',{title: 'title', message: result.results.authentication[0]['$'].message});
				});
			});
		});
		
		post_req.write(post_data);
		post_req.end();
	},

	AdminAuthorize: function(req,res,next,callback){
		Authorize(req,res,next,function(id,username){
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
						callback(id,username);
					}
					else res.render('invalid',{title: 'title', message: result.results.authentication[0]['$'].message});
				});
			});
		});
	},

	AppDevAuthorize: function(req,res,next,callback)
	{
		Authorize(req,res,next,function(id,username){
			if(auth.results.authentication[0]['$'].code==0 && username == 'AppDev'){
				callback(auth,username);
			}
			else res.render('invalid',{title: 'title', message: result.results.authentication[0]['$'].message});
		});
	},

	DatabaseInit: function(req,res,next,callback){
		AppDevAuthorize(req,res,next,function(id,username){
			var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
			pg.connect(connectionString, function(err,client,done){
				if(err){
					return console.error('could not connect to postgres', err);
				}
				message = 'Created Tables';
				client.on('error', function(error){
					message = error;
				});
				client.on('end',function(){
					callback(message);
				});
				client.query("create table Administrators(MemberID int PRIMARY KEY, AddedById int, DateTimeAdded timestamp not null default current_timestamp);").on('error', function(error2){message = error2;});
				client.query("create table Alerts(AlertID serial primary key, AlertText text, AlertTime timestamp, AlertCreator int references Administrators(MemberID));").on('error', function(error2){message = error2;});
				client.query("create table Tasks(TaskID serial primary key, CreatorID int references Administrators(MemberID), ChargedID int, Title text, Description text, TimeCreated timestamp not null default current_timestamp, TimeDue timestamp, RepeatPeriod varchar(5), RepeatIncrement int, RepeatEnd timestamp, MarkTime timestamp);").on('error', function(error2){message = error2;});
				client.query("create table Trucks(TruckID serial primary key, TruckCreatorName text, TruckSerial text, TruckModel text, TruckMake text, TruckName text unique, TruckPlate text, DateCreated timestamp  not null default current_timestamp);").on('error', function(error2){message = error2;});
				client.query("create table Runs(RunID serial primary key, TruckID int references Trucks(TruckID));").on('error', function(error2){message = error2;});
				client.query("create table TruckStatusEntries(StatusEntryID serial primary key, RunID int references Runs(RunID), Status varchar(10), StatusTime timestamp not null default current_timestamp, MemberName text);").on('error', function(error2){message = error2;});
				client.query("create table CallEntries(CallEntryID serial primary key, RunID int references Runs(RunID), CallType text, CallLocation text, CallDestination text, DriverName text, AdditionalNames text, RunNumber text);").on('error', function(error2){message = error2;});
				done();
			});
		});
	},

	DatabaseClear: function(req,res,next,callback){
		AppDevAuthorize(req,res,next,function(id,username){	
			var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
			pg.connect(connectionString, function(err,client,done){
				if(err){
					return console.error('could not connect to postgres', err);
				}
				message = 'Dropped Tables';
				client.on('error', function(error){
					message = error;
				});
				client.on('end',function(){
					callback(message);
				});
				client.query("drop table CallEntries;").on('error', function(error2){message = error2;});
				client.query("drop table TruckStatusEntries;").on('error', function(error2){message = error2;});
				client.query("drop table Runs;").on('error', function(error2){message = error2;});
				client.query("drop table Trucks;").on('error', function(error2){message = error2;});
				client.query("drop table Tasks;").on('error', function(error2){message = error2;});
				client.query("drop table Alerts;").on('error', function(error2){message = error2;});
				client.query("drop table Administrators;").on('error', function(error2){message = error2;});
				done();
			});
		});
	},

	AddTruck: function(req,res,next,callback){
		AdminAuthorize(req,res,next,function(id,username){
			//add the truck to the database
			//first get the first and last name of the currently logged in user
			var post2_data = querystring.stringify({
				accid: accid,
				acckey: key,
				cmd: 'getMembers',
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
						var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
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
		AdminAuthorize(req,res,next,function(id,username){
			//Get trucks from database as an object
			var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
			pg.connect(connectionString, function(err3,client2,done2){
				console.log('connection complete');
				trucks = [];
				if(err3){
					console.error('could not connect to postgres', err);
				}
				var query2 = client2.query("select TruckName,TruckID from Trucks;");
				query2.on('row', function(row2){
					//console.log(row);
					trucks.push(row2);
				});
				query2.on('error', function(error2){
					console.log(error);
					res.render('error', {title: 'Error', error: error});
				});
				query2.on('end', function(results2){
					done2();
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
		AdminAuthorize(req,res,next,function(id,username){
			var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
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
					done2();
					message = "Deleted truck with id "+req.body.truckid;
					callback(message);
				});
			});
		});
	},

	EditTruck: function(req,res,next,callback){
		AdminAuthorize(req,res,next,function(id,username){
			var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
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
	},

	AddTask: function(req,res,next,callback){
		AdminAuthorize(req,res,next,function(id,username){
			var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
			pg.connect(connectionString, function(err2,client2,done2){
				if(err2){
					return console.error('could not connect to postgres', err2);
				}
				var query2 = client2.query("insert into Tasks(CreatorID,ChargedID,Title,Description,TimeDue,RepeatPeriod,RepeatIncrement,RepeatEnd) values($1,$2,$3,$4,$5,$6,$7,$8);",[req.body.creatorid,req.body.chargedid,req.body.title,req.body.description,req.body.timedue,req.body.repeatperiod,req.body.repeatincrement,req.body.repeatend]);
				query2.on('row', function(row2){
					console.log(row);

				});
				query2.on('error', function(error2){
					console.log(error2);
					error={};
					error.status=error2;
					error.stack=error2;
					res.render('error', {title: 'Error',error: error});
				});
				query2.on('end', function(results2){
					message = 'Added Task ' + req.body.title;
					callback(message);
				});
			});
		});
	},

	GetTasks: function(req,res,next){
		AdminAuthorize(req,res,next,function(id,username){
			marked=false;
			var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
			pg.connect(connectionString, function(err3,client2,done2){
				console.log('connection complete');
				tasks = [];
				if(err3){
					console.log('could not connect to postgres', err);
				}
				var query2 = client2.query("select Title,TaskID,TimeDue,RepeatPeriod,RepeatIncrement,RepeatEnd,MarkTime from Tasks;");
				query2.on('row', function(row2){ 
					//console.log(row);
					tasks.push(row2);
				});
				query2.on('error', function(error2){
					console.log(error);
					res.send(error);
				});
				query2.on('end', function(results2){
					done2();
					finalhtml = '<form name="deleteTask" action="/admin/deltetaskprompt" method="post">';
					tasks.forEach(function(item){
						//check if marked no repeat
						marked=false;
						milli=0;
						if(item.repeatperiod=="none"){
							if(item.marktime) marked=true;
							else marked=false;
						}
						//If hourly,daily or weekly use same base
						if(item.repeatperiod=="hourly"){
							milli=60*60*1000;
						} else if (item.repeatperiod=="daily"){
							milli=24*60*60*1000;
						} else if (item.repeatperiod=="weekly"){
							milli=7*24*60*60*1000;
						}
						current = new Date();
						start = new Date(item.timedue);
						end = new Date(item.repeatend);
						marktime = new Date(item.marktime);
						//end date has passed
						if(item.repeatperiod=="hourly" || item.repeatperiod=="daily" || item.repeatperiod=="weekly"){
							if(end-current <= 0 && (item.marktime)) marked=true;
							else {
								totalbase=(current-start)/milli;
								lastincrement = totalbase % item.repeatincrement;
								lastincrement = totalbase - lastincrement;
								if(marktime-lastincrement > 0) marked=true;
								else marked=false;
							}
						}
						//if monthly
						if(item.repeatperiod=="monthly"){
							totalyears = current.getYear() - start.getYear();
							totalmonths = (current.getMonth() - start.getMonth())+(totalyears*12);
							lastincrement = totalmonths % item.repeatincrement;
							lastincrement = totalmonths - lastincrement;
							lastmonth = lastincrement%12;
							lastyear = floor(lastincrement/12);
							lasttime = start;
							lasttime.setYear(start.getYear() + lastyear);
							lasttime.setMonth(start.getMonth() + lastmonth);
							if(marktime-lasttime >= 0) marked = true;
							else marked = false;
						}
						if(item.repeatperiod=="yearly"){
							totalyears = current.getYear() - start.getYear();
							lastincrement = totalyears % item.repeatincrement;
							lastincrement = totalmonths - lastincrement;
							lasttime = start;
							lasttime.setYear(start.getYear + lastincrement);
							if(marktime-lasttime >= 0) marked = true;
							else marked = false;
						}
						if(marked) finalhtml=finalhtml+"<s>";
						finalhtml = finalhtml + '<div class="li"><input class="taskradio" type="radio" name="taskgroup" value="'+item.taskid+'"><a href="#" onClick="togglemark('+item.taskid+');">' + item.title + '</a></input></div>';
						if(marked) finalhtml=finalhtml+"</s>";
					});
					finalhtml = finalhtml + '<input type="submit" value="Delete Task"></input></form>';
					res.send(finalhtml);
				});
			});
		});
	}
}