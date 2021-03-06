/*******************************************************************************************************//**
*	\file functions.js
*	\brief Dumping ground for functions that need a new home
*	\details Dumping ground for functions that need a new home
*   \author Joshua Lucier
*	\version 0.1
*	\date September 30, 2016
*	\pre Must have working API
*	\copyright MIT License
***********************************************************************************************************/

var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var express = require('express');
var querystring = require('querystring');
var https = require('https');
var secret = process.env.secret;
var accid = process.env.accid;
var acckey = process.env.key;
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
var crypto = require('crypto');
var algorithm = process.env.algorithm;
var encpassword = process.env.encpassword;
var randomstring = require('randomstring');
router.use(cookieParser(secret));
router.use(cookieSession({
  name: 'whiteriver',
  keys: [secret],
}));

//encrypts a string
function encrypt(text){
	var cipher = crypto.createCipher(algorithm,encpassword);
	var crypted = cipher.update(text,'utf8','hex');
	crypted += cipher.final('hex');
	return crypted;
}

//decrypts a string
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,encpassword)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

module.exports = {
	//Basic authorization function
	Authorize: function(req,res,next,callback){
		if(req.body.username && req.body.password){//if coming from /login
			username = req.body.username;
			password = req.body.password;
			var post_data = querystring.stringify({
				accid: accid,
				acckey: acckey,
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
							//generate a token
							token = randomstring.generate(15);
							//encrypt the token
							encrypted = encrypt(token);
							//store the token
							var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
							pg.connect(connectionString, function(err,client,done){
								if(err){
									return console.error('could not connect to postgres', err);
								}
								var query = client.query("insert into Tokens(UserName,UserID,Token) values($1,$2,$3);",[username,id,token]);
								query.on('row', function(row){
									//console.log(row);
								});
								query.on('error', function(error){
									console.log(error);
									res.render('error', {title: 'Error'});
								});
								query.on('end', function(results){
									done();
									res.cookie('username',username);
									res.cookie('encrypted',encrypted);
									callback(id,username);
								});
							});
						}
						else res.render('invalid',{title: 'title', message: result.results.authentication[0]['$'].message});
					});
				});
			});
			
			post_req.write(post_data);
			post_req.end();
		} else if (req.cookies.username && req.cookies.encrypted){//if coming from other but already authenticated
			username = req.cookies.username;
			encrypted = req.cookies.encrypted;
			token = {};
			var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
			pg.connect(connectionString, function(err,client,done){
				if(err){
					return console.error('could not connect to postgres', err);
				}
				var query = client.query("select * from Tokens where UserName=$1",[username]);
				query.on('row', function(row){
					token = row;
				});
				query.on('error', function(error){
					console.log(error);
					res.render('error', {title: 'Error'});
				});
				query.on('end', function(results){
					done();
					decrypted = decrypt(encrypted);
					if(decrypted==token.token) {
						callback(token.userid,username);
					}
					else {
						res.send('Failed on Authorize: Token did not match encrypted token...<a href="/logout">Clear Authentication Data</a>');
					}
				});
			});
		} else {  //not authenticated or coming from /login need to redirect to login
			res.cookie('url',req.originalUrl);
			res.render('login',{title: 'Login'});
			return;
		}


	},

	//Admin authorization function
	AdminAuthorize: function(req,res,next,callback){
		Authorize(req,res,next,function(id,username){
			var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
			admin = false;
			pg.connect(connectionString, function(err,client,done){
				if(err){
					return console.error('could not connect to postgres', err);
				}
				var query = client.query("select MemberID from myAdministrators where MemberID=" + id + ";");
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
					else res.render('invalid',{title: 'Invalid', message: "Not an Admin...."});
				});
			});
		});
	},

	//App Developer authorization function
	AppDevAuthorize: function(req,res,next,callback){
		if(req.body.username && req.body.password){//if coming from /login
			username = req.body.username;
			password = req.body.password;
		} else if(req.cookies.username && req.cookies.password){ //if already authenticated
			username = req.cookies.username;
			password = req.cookies.password;
		} else {  //not authenticated or coming from /login need to redirect to login
			res.cookie('url',req.originalUrl);
			res.render('appdevlogin',{title: 'Application Developer Login'});
			return;
		}
		var post_data = querystring.stringify({
			accid: accid,
			acckey: acckey,
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
						if(username == 'AppDev'){
							res.cookie('username',username);
							res.cookie('password',password);
							callback(id,username);
						}
						else res.render('invalid',{title: 'title', message: result.results.authentication[0]['$'].message});
					}
					else res.render('invalid',{title: 'title', message: result.results.authentication[0]['$'].message});
				});
			});
		});
		
		post_req.write(post_data);
		post_req.end();
	},

	//Creates all tables in database
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
					callback(error);
				});
				client.on('end',function(){
				});
				query1 = client.query("create table if not exists myAdministrators(MemberID int PRIMARY KEY, AddedById int, DateTimeAdded timestamp not null default current_timestamp);").on('error', function(error2){message = 'myAdministrators '+error2; console.log(message);});
				query1.on('end',function(){
					query2 = client.query("create table if not exists Alerts(AlertID serial primary key, AlertText text, AlertTime timestamp, AlertCreator int);").on('error', function(error2){message = 'Alerts '+error2; console.log(message);});
					query2.on('end',function(){
						query3 = client.query("create table if not exists Tasks(TaskID serial primary key, CreatorID int, ChargedID int, Title text, Description text, TimeCreated timestamp not null default current_timestamp, TimeDue timestamp, RepeatPeriod varchar(10), RepeatIncrement int, RepeatEnd timestamp, MarkTime timestamp);").on('error', function(error2){message = 'Tasks '+error2; console.log(message);});
						query3.on('end',function(){
							query4 = client.query("create table if not exists Trucks(TruckID serial primary key, TruckCreatorName text, TruckSerial text, TruckModel text, TruckMake text, TruckName text unique, TruckPlate text, DateCreated timestamp  not null default current_timestamp);").on('error', function(error2){message = 'Trucks '+error2; console.log(message);});
							query4.on('end',function(){
								query5 = client.query("create table if not exists Runs(RunID serial primary key, TruckID int, Status bool);").on('error', function(error2){message = 'Runs ' + error2;});
								query5.on('end',function(){
									query6 = client.query("create table if not exists TruckStatusEntries(StatusEntryID serial primary key, RunID int references Runs(RunID), Status varchar(10), StatusTime timestamp not null default current_timestamp, MemberName text);").on('error', function(error2){message = 'TruckStatusEntries '+error2; console.log(message);});
									query6.on('end',function(){
										query7 = client.query("create table if not exists CallEntries(CallEntryID serial primary key, RunID int references Runs(RunID), CallType text, CallLocation text, CallDestination text, DriverName text, PrimaryCare text, AdditionalNames text, RunNumber text);").on('error', function(error2){message = 'CallEntries '+error2; console.log(message);});
										query7.on('end',function(){
											query8 = client.query("create table if not exists Tokens(TokenID serial primary key, UserName text, UserID text, Token text);").on('error', function(error2){message = 'Tokens '+error2; console.log(message);});
											query8.on('end',function(){
												query9 = client.query("INSERT INTO myAdministrators(memberid, addedbyid, datetimeadded) VALUES (61, 61, '2016-06-22 10:23:54+02');");
												query9.on('end',function(){
													query10 = client.query("create table if not exists Exclusions(ExclusionID serial primary key, MemberID int);").on('error', function(error2){message = 'Exclusions '+error2; console.log(message);});
													query10.on('end',function(){
														done();
														callback(message);
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	},

	//Deletes all tables in the database
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
					callback(error);
				});
				client.on('end',function(){
				});
				query1 = client.query("drop table if exists CallEntries;").on('error', function(error2){message = error2;});
				query1.on('end',function(){
					query2 = client.query("drop table if exists TruckStatusEntries;").on('error', function(error2){message = error2;});
					query2.on('end',function(){
						query3 = client.query("drop table if exists Runs;").on('error', function(error2){message = error2;});
						query3.on('end', function(){
							query4 = client.query("drop table if exists Trucks;").on('error', function(error2){message = error2;});
							query4.on('end', function(){
								query5 = client.query("drop table if exists Tasks;").on('error', function(error2){message = error2;});
								query5.on('end',function(){
									query6 = client.query("drop table if exists Alerts;").on('error', function(error2){message = error2;});
									query6.on('end',function(){
										query7 = client.query("drop table if exists myAdministrators;").on('error', function(error2){message = error2;});
										query7.on('end',function(){
											query8 = client.query("drop table if exists Tokens;").on('error', function(error2){message = error2;});
											query8.on('end',function(){
												query9 = client.query("drop table if exists Exclusions;").on('error', function(error2){message = error2;});
												query9.on('end', function(){
													done();
													callback(message);
												});
											});
										});
									});
								});
							});
						});
					});
				});		
			});
		});
	},

	//Adds a truck to the admin page
	AddTruck: function(req,res,next,callback){
		AdminAuthorize(req,res,next,function(id,username){
			//add the truck to the database
			//first get the first and last name of the currently logged in user
			var post2_data = querystring.stringify({
				accid: accid,
				acckey: acckey,
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

	//Deletes a truck
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

	//Edit truck information
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

	//adds a task
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

	//Get a list of tasks
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
				var query2 = client2.query("select Title,TaskID,TimeDue,RepeatPeriod,RepeatIncrement,RepeatEnd,MarkTime from Tasks order by Title;");
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
					finalhtml = '<form name="deleteTask" action="/admin/deletetaskprompt" method="post">';
					tasks.forEach(function(item){
						day=24*60*60*1000;
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
							if(current-end >= 0 && !(item.marktime=="")) marked=true; //if current time is beyond repeat end time and item is marked
							else {
								//increment time
								//number of days since last increment = remainder number of days divided number of days between increments
								//number of days from start to finish = (current-start)/milli  
								numberofperiods=(current-start)/milli;
								periodssincelastincrement = numberofperiods % item.repeatincrement;
								numberofperiodstolastincrement = numberofperiods - periodssincelastincrement;
								millisecondstolastincrement = numberofperiodstolastincrement*milli;
								if(marktime-start > millisecondstolastincrement)  //if mark time is after last increment
								{
									console.log("false truth");
									marked=true; //if marktime is after last increment then marked= true
								}
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
						
						finalhtml = finalhtml + '<div class="li"><label>';
						if(marked) finalhtml=finalhtml+"<s>";
						finalhtml = finalhtml + '<input class="taskradio" type="radio" name="taskid" value="'+item.taskid+'"><span></span><a href="/admin/edittaskform?taskid='+item.taskid+'">' + item.title + '</a>';
						if(marked) finalhtml=finalhtml+"</s>";
						finalhtml = finalhtml + '</label><a onClick="ToggleMark('+item.taskid+');"><img src="/images/check.png" class="checkmark"></a></div>';
					});
					finalhtml = finalhtml + '<input type="submit" value="Delete Task"></input></form>';
					res.send(finalhtml);
				});
			});
		});
	}
}