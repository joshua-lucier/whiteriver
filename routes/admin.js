var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var express = require('express');
var querystring = require('querystring');
var https = require('https');
var router = express.Router();
var secret = process.env.secret;
var accid = process.env.accid;
var acckey = process.env.key;
var pgusername = process.env.pgusername;
var pgpassword = process.env.pgpassword;
var pghost = process.env.pghost;
var pgdatabase = process.env.pgdatabase;
var parseString = require('xml2js').parseString;
var pg = require('pg');
var fs = require('fs');
var csv = require('express-csv');
var copyTo = require('pg-copy-streams').to;
router.use(cookieParser(secret));
router.use(cookieSession({
  name: 'whiteriver',
  keys: [secret]
}));
AddTruck = require('./functions').AddTruck;
GetTrucks = require('./functions').GetTrucks;
DeleteTruck = require('./functions').DeleteTruck;
EditTruck = require('./functions').EditTruck;
AdminAuthorize = require('./functions').AdminAuthorize;
AddTask = require('./functions').AddTask;
GetTasks = require('./functions').GetTasks;

/*Main Page of the admin app*/
router.get('/', function(req, res, next){
	AdminAuthorize(req,res,next,function(auth,username){
		res.render('admin', {title: 'Admin Page', username: username});
	});
});

router.get('/addtruck', function(req,res,next){
	AdminAuthorize(req,res,next,function(auth,username){	
		res.render('addtruck', {title: 'Add a Truck', username: username});
	});
});

router.post('/finishtruck', function(req,res,next){
	AddTruck(req,res,next,function(message){

		res.render('admin',{title: 'Admin', message:message});
	});
});

router.get('/gettrucks', function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
		//Get trucks from database as an object
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err3,client2,done2){
			console.log('connection complete');
			trucks = [];
			if(err3){
				console.error('could not connect to postgres', err);
			}
			var query2 = client2.query("select TruckName,TruckID from Trucks order by TruckName;");
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
				finalhtml = '<form name="deleteTruck" action="/admin/deletetruckprompt" method="post">';
				trucks.forEach(function(item){
					finalhtml = finalhtml + '<div class="li"><input class="truckradio" type="radio" name="truckgroup" value="'+item.truckname+'"><a href="/admin/edittruckform?truckid='+item.truckid+'">' + item.truckname + '</a></input></div>';
				});
				finalhtml = finalhtml + '<input type="submit" value="Delete Truck"></input></form>';
				res.send(finalhtml);
			});
		});
	});
});

router.post('/deletetruckprompt', function(req,res,next){
	var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
	pg.connect(connectionString, function(err,client,done){
		if(err){
			return console.error('could not connect to postgres', err);
		}
		truck = {};
		//console.log(JSON.stringify(req.body.truckgroup));
		truckname = req.body.truckgroup;
		console.log(JSON.stringify(truckname));
		var query = client.query("select * from Trucks where TruckName = $1;", [truckname]);
		query.on('row', function(row){
			truck = row;
		});
		query.on('error', function(error){
			console.log(error);
			res.render('error', {title: 'Error'});
		});
		query.on('end', function(results){
			done();
			console.log(truck);
			AdminAuthorize(req,res,next,function(id,username){
				res.render('deletetruck', {title: 'Remove Truck?',truck: truck, username: username});
			});
		});
	});
});

router.post('/deletetruck', function(req,res,next){
	DeleteTruck(req,res,next,function(message){
		res.render('admin',{title: ' Admin', message: message, username: username});
	});
});

router.get('/edittruckform', function(req,res,next){
	var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
	pg.connect(connectionString, function(err,client,done){
		if(err){
			return console.error('could not connect to postgres', err);
		}
		truck = {};
		//console.log(JSON.stringify(req.body.truckgroup));
		truckid = req.query.truckid;
		//console.log(JSON.stringify(truckname));
		var query = client.query("select * from Trucks where TruckID = $1;", [truckid]);
		query.on('row', function(row){
			truck = row;
		});
		query.on('error', function(error){
			console.log(error);
			res.render('error', {title: 'Error'});
		});
		query.on('end', function(results){
			done();
			console.log(truck);
			AdminAuthorize(req,res,next,function(id,username){
				res.render('edittruck', {title: 'Edit Truck',truck: truck});
			});
		});
	});
});

router.post('/edittruck', function(req,res,next){
	EditTruck(req,res,next,function(message){
		res.render('admin',{title: 'Admin',message: message, username: username});
	});
});

router.get('/addtaskform', function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
		names = [];
		ids = [];
		exclusions = [];
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
				var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
				pg.connect(connectionString, function(err,client,done){
					var query2 = client.query("select * from Exclusions;");
					query2.on('row', function(row){
						exclusions.push(row.memberid);
					});
					query2.on('end', function(results2){
						parseString(chunk2, function(err2, result2){
							creatorname = '';
							//console.log(result2.results.members[0].member[0]['$'].id);
							//console.log(result2.results.members[0].member[0].name[0]);
							//extract the name of the user from result2
							result2.results.members[0].member.forEach(function(item){
								exclusion = false;
								exclusions.forEach(function(exclusionitem){
									if(item['$'].id == exclusionitem) exclusion = true;
								});
								if(!exclusion){
									ids.push(item['$'].id);
									names.push(item.name[0]);
								}
							});
							res.render('addtask',{title: 'Add Task',id: id,ids: ids, names: names});
						});
					});
				});
			});
		});
		post2_req.write(post2_data);
		post2_req.end();

	});
});

router.post('/addtask',function(req,res,next){
	AddTask(req,res,next,function(message){
		res.render('admin',{title: 'Admin Page',message: message});
	});
});

router.get('/gettasks',function(req,res,next){
	GetTasks(req,res,next);
});

router.get('/togglemark',function(req,res,next){
	taskid=req.query.taskid;
	AdminAuthorize(req,res,next,function(id,username){
		marked = false;
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err,client,done){
			if(err){
				return console.error('could not connect to postgres', err);
			}
			//console.log(JSON.stringify(req.body.truckgroup));
			taskid = req.query.taskid;
			//console.log(JSON.stringify(truckname));
			var query = client.query("select MarkTime from Tasks where TaskID=$1",[taskid]);
			query.on('row', function(row){
				console.log(row.marktime);
				if(row.marktime==null) marked=false;
				else marked=true;
			});
			query.on('error', function(error){
				console.log(error);
				error = {};
				error.stack = error;
				error.status = error;
				res.render('error', {title: 'Error', error: error});
			});
			query.on('end', function(results){
				if(marked==false){
					var query2 = client.query("update Tasks set MarkTime=current_timestamp where TaskID=$1;", [taskid]);
					query2.on('error', function(error){
						console.log(error);
						error = {};
						error.stack = error;
						error.status = error;
						res.render('error', {title: 'Error', error: error});
					});
					query2.on('end', function(results){
						done();
						res.send('Unchecked Item');
					});
				} else {
					var query2 = client.query("update Tasks set MarkTime=NULL where TaskID=$1;",[taskid]);
					query2.on('error', function(error){
						console.log(error);
						error = {};
						error.stack = error;
						error.status = error;
						res.render('error', {title: 'Error', error: error});
					});
					query2.on('end', function(results){
						done();
						res.send('Unchecked Item');
					});
				}
			});
		});
	});
});

router.post('/deletetaskprompt', function(req,res,next){
	var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
	pg.connect(connectionString, function(err,client,done){
		if(err){
			return console.error('could not connect to postgres', err);
		}
		task = {};
		//console.log(JSON.stringify(req.body.truckgroup));
		taskid = req.body.taskid;
		console.log(JSON.stringify(taskid));
		var query = client.query("select * from Tasks where TaskID = $1;", [taskid]);
		query.on('row', function(row){
			task = row;
		});
		query.on('error', function(error){
			console.log(error);
			res.render('error', {title: 'Error'});
		});
		query.on('end', function(results){
			done();
			console.log(task);
			AdminAuthorize(req,res,next,function(id,username){
				res.render('deletetask', {title: 'Remove Task?',task: task, username: username});
			});
		});
	});
});

router.post('/deletetask', function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err2,client2,done2){
			if(err2){
				return console.error('could not connect to postgres', err2);
			}
			var query2 = client2.query("delete from Tasks where taskid=$1;",[req.body.taskid]);
			query2.on('row', function(row2){
				console.log(row);

			});
			query2.on('error', function(error2){
				console.log(error2);
				res.render('error', {title: 'Error'});
			});
			query2.on('end', function(results2){
				done2();
				message = "Deleted task with id "+req.body.taskid;
				res.render('admin',{title: ' Admin', message: message, username: username});
			});
		});
	});
});

router.get('/edittaskform', function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err,client,done){
			if(err){
				return console.error('could not connect to postgres', err);
			}
			task = {};
			//console.log(JSON.stringify(req.body.truckgroup));
			taskid = req.query.taskid;
			//console.log(JSON.stringify(truckname));
			var query = client.query("select * from Tasks where TaskID = $1;", [taskid]);
			query.on('row', function(row){
				task = row;
			});
			query.on('error', function(error){
				console.log(error);
				res.render('error', {title: 'Error'});
			});
			query.on('end', function(results){
				done();
				names = [];
				ids = [];
				exclusions = [];
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
						var query2 = client.query("select * from Exclusions;");
						query2.on('row', function(row){
							exclusions.push(row.memberid);
						});
						query2.on('end', function(results2){
							parseString(chunk2, function(err2, result2){
								creatorname = '';
								//console.log(result2.results.members[0].member[0]['$'].id);
								//console.log(result2.results.members[0].member[0].name[0]);
								//extract the name of the user from result2
								result2.results.members[0].member.forEach(function(item){
									exclusion = false;
									exclusions.forEach(function(exclusionitem){
										if(item['$'].id == exclusionitem) exclusion = true;
									});
									if(!exclusion){
										ids.push(item['$'].id);
										names.push(item.name[0]);
									}
								});
								dates={};
								dates.repeatend = JSON.stringify(task.repeatend);
								dates.timedue = JSON.stringify(task.timedue);
								res.render('edittask',{title: 'Edit Task',task: task,id: task.taskid,ids: ids, names: names, dates: dates});
							});
						});
					});
				});
				post2_req.write(post2_data);
				post2_req.end();
			});
		});
	});
});

router.post("/edittask",function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err2,client2,done2){
			if(err2){
				return console.error('could not connect to postgres', err2);
			}
																																																				//insert into Tasks(CreatorID,ChargedID,Title,Description,TimeDue,RepeatPeriod,RepeatIncrement,RepeatEnd
			var query2 = client2.query("update Tasks set CreatorID = $1, ChargedID = $2, Title = $3, Description = $4, TimeDue = $5, RepeatPeriod = $6, RepeatIncrement = $7, RepeatEnd = $8 where TaskID = $9;",[req.body.creatorid,req.body.chargedid,req.body.title,req.body.description,req.body.timedue,req.body.repeatperiod,req.body.repeatincrement,req.body.repeatend, req.body.taskid]);
			query2.on('row', function(row2){
				console.log(row);

			});
			query2.on('error', function(error2){
				console.log(error2);
				error = {};
				error.status = error2;
				error.stack = error2;
				res.render('error', {title: 'Error'});
			});
			query2.on('end', function(results2){
				message = 'Updated Task Information';
				res.render('admin',{title: 'Admin', message: message, username: username})
			});
		});
	});
});

router.get("/todaystasks",function(req,res,next){
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
				current = new Date();
				timedue = new Date(row2.timedue);
				//if due before or on today
				if((current - timedue) >= 0) 
				{
					tasks.push(row2);
				}
			});
			query2.on('error', function(error2){
				console.log(error);
				res.send(error);
			});
			query2.on('end', function(results2){
				done2();
				finalhtml = '<form name="deleteTodayTask" action="/admin/deletetaskprompt" method="post">';
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
					if(marked==false){
						finalhtml = finalhtml + '<div class="li"><input class="taskradio" type="radio" name="taskid" value="'+item.taskid+'"><a href="/admin/edittaskform?taskid='+item.taskid+'">' + item.title + '</a><a onClick="togglemark('+item.taskid+');"><img src="/images/check.png" class="checkmark"></a></input></div>';
					}
				});
				finalhtml = finalhtml + '<input type="submit" value="Delete Task"></input></form>';
				res.send(finalhtml);
			});
		});
	});
});

router.get('/addalertform',function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
		res.render('addalert',{title: 'Add an alert'});
	});
});

router.post('/addalert',function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
		alertcreator = id;
		alerttext = req.body.alerttext;
		alerttime = req.body.alerttime;
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err3,client2,done2){
			console.log('connection complete');
			if(err3){
				console.error('could not connect to postgres', err);
			}
			var query2 = client2.query('insert into Alerts(AlertText,AlertTime,AlertCreator) values ($1,$2,$3);',[alerttext,alerttime,alertcreator]);
			console.log('query complete');
			query2.on('end', function(results){
				done2();
				message = username + " created alert " + alerttext;
				res.render('admin',{title: 'Admin',message: message});
			});
			query2.on('error', function(error2){
				console.log(error2);
				error={};
				error.stack = error2;
				error.status = error2;
				res.render('error', {title: 'Error', error: error});
			});
		});
	});
});

router.get('/getalerts',function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
				//Get trucks from database as an object
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err3,client2,done2){
			console.log('connection complete');
			alerts = [];
			if(err3){
				console.error('could not connect to postgres', err);
			}
			var query2 = client2.query("select AlertID,AlertText,AlertTime from Alerts;");
			query2.on('row', function(row2){
				//console.log(row);
				alerts.push(row2);
			});
			query2.on('error', function(error2){
				error={};
				error.status = error2;
				error.stack = error2;
				res.render('error', {title: 'Error', error: error});
			});
			query2.on('end', function(results2){
				done2();
				finalhtml = '<form name="deleteAlert" action="/admin/deletealertprompt" method="post">';
				alerts.forEach(function(item){
					finalhtml = finalhtml + '<div class="li"><input class="truckradio" type="radio" name="alertid" value="'+item.alertid+'"><a href="/admin/editalertform?alertid='+item.alertid+'">' + item.alerttext + '</a></input></div>';
				});
				finalhtml = finalhtml + '<input type="submit" value="Delete Alert"></input></form>';
				res.send(finalhtml);
			});
		});
	});
});

router.get('/editalertform',function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err2,client2,done2){
			if(err2){
				return console.error('could not connect to postgres', err2);
			}
			alert={};
			alertid = req.query.alertid;																																//insert into Tasks(CreatorID,ChargedID,Title,Description,TimeDue,RepeatPeriod,RepeatIncrement,RepeatEnd
			var query2 = client2.query("select * from Alerts where AlertID=$1",[alertid]);
			query2.on('row', function(row2){
				alert=row2;
			});
			query2.on('error', function(error2){
				console.log(error2);
				error = {};
				error.status = error2;
				error.stack = error2;
				res.render('error', {title: 'Error'});
			});
			query2.on('end', function(results2){
				alerttime = JSON.stringify(alert.alerttime);
				res.render('editalert',{title: 'Edit Alert',alert: alert,alerttime: alerttime});
			});
		});
	});
});

router.post('/editalert',function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err3,client2,done2){
			console.log('connection complete');
			if(err3){
				console.error('could not connect to postgres', err);
			}
			var query2 = client2.query('update Alerts set AlertText = $1, AlertTime = $2, AlertCreator = $3 where AlertID=$4;',[req.body.alerttext,req.body.alerttime,req.body.alertcreator,req.body.alertid]);
			console.log('query complete');
			query2.on('end', function(results){
				done2();
				message = "Alert " + req.body.alertid + " updated";
				res.render('admin',{title: 'Admin',message: message});
			});
			query2.on('error', function(error2){
				console.log(error2);
				error={};
				error.stack = error2;
				error.status = error2;
				res.render('error', {title: 'Error', error: error});
			});
		});
	});
});

router.post('/deletealertprompt',function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err,client,done){
			if(err){
				return console.error('could not connect to postgres', err);
			}
			alert = {};
			//console.log(JSON.stringify(req.body.truckgroup));
			alertid = req.body.alertid;
			var query = client.query("select * from Alerts where AlertID = $1;", [alertid]);
			query.on('row', function(row){
				alert = row;
			});
			query.on('error', function(error){
				console.log(error);
				res.render('error', {title: 'Error'});
			});
			query.on('end', function(results){
				done();
				res.render('deletealert', {title: 'Remove Task?',task: alert, username: username});
			});
		});
	});
});

router.post('/deletealert',function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err2,client2,done2){
			if(err2){
				return console.error('could not connect to postgres', err2);
			}
			var query2 = client2.query("delete from Alerts where alertid=$1;",[req.body.alertid]);
			query2.on('row', function(row2){
			});
			query2.on('error', function(error2){
				console.log(error2);
				res.render('error', {title: 'Error'});
			});
			query2.on('end', function(results2){
				done2();
				message = "Deleted alert with id "+req.body.alertid;
				res.render('admin',{title: ' Admin', message: message, username: username});
			});
		});
	});
});

router.get('/todaysalerts', function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err3,client2,done2){
			console.log('connection complete');
			alerts = [];
			if(err3){
				console.error('could not connect to postgres', err);
			}
			var query2 = client2.query("select AlertID,AlertText,AlertTime from Alerts;");
			query2.on('row', function(row2){
				//console.log(row);
				alertdate = new Date(row2.alerttime);
				today = new Date();
				if(alertdate.getDay()==today.getDay() && alertdate.getMonth()==today.getMonth() && alertdate.getYear()==today.getYear()){
					alerts.push(row2);	
				}
				
			});
			query2.on('error', function(error2){
				error={};
				error.status = error2;
				error.stack = error2;
				res.render('error', {title: 'Error', error: error});
			});
			query2.on('end', function(results2){
				done2();
				finalhtml = '<form name="deleteTopAlert" action="/admin/deletealertprompt" method="post">';
				alerts.forEach(function(item){
					finalhtml = finalhtml + '<div class="li"><input class="truckradio" type="radio" name="alertid" value="'+item.alertid+'"><a href="/admin/editalertform?alertid='+item.alertid+'">' + item.alerttext + '</a></input></div>';
				});
				finalhtml = finalhtml + '<input type="submit" value="Delete Alert"></input></form>';
				res.send(finalhtml);
			});
		});
	});
});

router.get('/getadmins',function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err3,client2,done2){
			console.log('connection complete');
			adminids = [];
			ids = [];
			names = [];
			exclusions = [];
			if(err3){
				console.error('could not connect to postgres', err);
			}
			var query2 = client2.query("select * from myAdministrators;");
			query2.on('row', function(row2){
				adminids.push(row2.memberid);
				
			});
			query2.on('error', function(error2){
				error={};
				error.status = error2;
				error.stack = error2;
				res.send(error2);
			});
			query2.on('end', function(results2){
				done2();
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
						query3 = client2.query("select * from Exclusions;");
						query3.on('error',function(error){
							error={};
							error.status = error2;
							error.stack = error2;
							res.send(error2);
						});
						query3.on('row', function(row){
							exclusions.push(row);
						});
						query3.on('end', function(results){
							parseString(chunk2, function(err2, result2){
								result2.results.members[0].member.forEach(function(item){
									ids.push(item['$'].id);
									names.push(item.name[0]);
								});
								finalhtml = "";
								ids.forEach(function(item,index){
									admin = false;
									excluded = false;
									adminids.forEach(function(adminitem){
										if(item==adminitem){
											admin = true;
										}
									});
									exclusions.forEach(function(exclusion){
										if(exclusion.memberid==item){
											excluded = true;
										}
									});
									if(admin) finalhtml = finalhtml + '<div class="li"><a onClick="toggleadmin('+item+');">'+names[index]+' [ADMIN]</a>';
									else finalhtml = finalhtml  + '<div class="li"><a onClick="toggleadmin('+item+');">'+names[index]+' </a>';
									if(excluded) finalhtml = finalhtml + '<a onClick="toggleexclude('+item+');"><img class="xmark" src="/images/fullx.png"></a></div>';
									else finalhtml = finalhtml + '<a onClick="toggleexclude('+item+');"><img class="xmark" src="/images/emptyx.png"></a></div>';
								});
								res.send(finalhtml);
							});
						});
					});
				});
				post2_req.write(post2_data);
				post2_req.end();		
			});
		});
	});
});

router.get('/toggleadmin',function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
		memberid = req.query.memberid;
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err3,client2,done2){
			console.log('connection complete');
			wasadmin = false;
			if(err3){
				console.error('could not connect to postgres', err);
			}
			var query2 = client2.query("select * from myAdministrators where MemberID=$1;",[memberid]);
			query2.on('row', function(row2){
				query3 = client2.query("delete from myAdministrators where MemberID=$1;",[memberid]);
				wasadmin = true;		
			});
			query2.on('error', function(error2){
				error={};
				error.status = error2;
				error.stack = error2;
				res.send(error2);
			});
			query2.on('end', function(results2){
				done2();
				if(!wasadmin){
					query4 = client2.query("insert into myAdministrators(MemberID, AddedById) values($1,$2);",[memberid,id]);
				}
				res.send('finished admin toggle');
			});
		});
	});
});

router.get('/toggleexclude',function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
		memberid = req.query.memberid;
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err3,client2,done2){
			wasexcluded=false;
			if(err3){
				console.error('could not connect to postgres', err);
			}
			var query2 = client2.query("select * from Exclusions where MemberID=$1;",[memberid]);
			query2.on('row', function(row2){
				query3 = client2.query("delete from Exclusions where MemberID=$1",[memberid]);
				wasexcluded = true;
			});
			query2.on('error', function(error2){
				error={};
				error.status = error2;
				error.stack = error2;
				res.send(error2);
			});
			query2.on('end', function(results2){
				done2();
				if(!wasexcluded){
					query4 = client2.query("insert into Exclusions(MemberID) values($1);",[memberid]);
				}
				res.send('finished admin toggle');
			});
		});
	});
});

router.get('/callentrytable',function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
		callentries = [];
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err3,client2,done2){
			console.log('connection complete');
			wasadmin = false;
			if(err3){
				console.error('could not connect to postgres', err);
			}
			var query2 = client2.query("select CallEntryID,s2.StatusTime timeofcall,s1.StatusTime timeinservice, CallEntries.RunID, TruckName, CallType, CallLocation, CallDestination, DriverName, PrimaryCare, AdditionalNames, RunNumber from CallEntries,(select * from TruckStatusEntries where Status = 'responding') s2,(select * from TruckStatusEntries where Status = 'service') s1,(select TruckName,Runs.RunID from Trucks,Runs where Trucks.TruckID = Runs.TruckID) s3 where CallEntries.RunID = s1.RunID and CallEntries.RunID = s2.RunID and CallEntries.RunID = s3.RunID order by RunNumber;");
			query2.on('row', function(row2){
				callentries.push(row2);
			});
			query2.on('error', function(error2){
				console.log(error2);
				error={};
				error.status = error2;
				error.stack = error2;
				res.send(error2);
			});
			query2.on('end', function(results2){
				done2();
				res.render('callentrytable',{title: 'CallEntries',callentries: callentries});
			});
		});		
	});
});

router.get('/callentries.csv', function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
		var columns = ['CallEntryID','s2.StatusTime timeofcall','s1.StatusTime timeinservice','CallEntries.RunID','CallType','CallLocation','CallDestination','TruckName','DriverName','PrimaryCare','AdditionalNames','RunNumber'];
		var labels = ['Call Entry ID', 'Time of Call', 'Time in Service', 'Run ID', 'Call Type', 'Call Location', 'Call Destination', 'Truck', 'Driver Name', 'Primary Care', 'Additional Names', 'Run Number'];
		outcsv = [labels];
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err,client,done){
			var query = client.query("SELECT "+columns.join(', ')+" FROM CallEntries,(select * from TruckStatusEntries where Status = 'responding') s2,(select * from TruckStatusEntries where Status = 'service') s1, (select TruckName, Runs.RunID from Trucks, Runs where Trucks.TruckID = Runs.TruckID) s3 where CallEntries.RunID = s1.RunID and CallEntries.RunID = s2.RunID and CallEntries.RunID = s3.RunID order by RunNumber;");
			query.on('row', function(row) {
				// process column values; if you need to do special formatting (i.e. dates) don't loop and instead handle each one specially
				values = [];
				values.push(row.callentryid);
				values.push(row.timeofcall);
				values.push(row.timeinservice);
				values.push(row.runid);
				values.push(row.calltype);
				values.push(row.calllocation);
				values.push(row.calldestination);
				values.push(row.truckname);
				values.push(row.drivername);
				values.push(row.primarycare);
				values.push(row.additionalnames);
				values.push(row.runnumber);
				outcsv.push(values);
			});

			query.on('end', function(result) {
				done();
				res.csv(outcsv);
			});
		});
	});
});


module.exports = router;