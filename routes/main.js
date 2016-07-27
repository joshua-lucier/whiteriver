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
var pg = require('pg');
var parseString = require('xml2js').parseString;
router.use(cookieParser(secret));
router.use(cookieSession({
  name: 'whiteriver',
  keys: [secret]
}));
Authorize = require('./functions').Authorize;

/*Main Page of the main display app*/
router.get('/', function(req,res,next){
	Authorize(req,res,next,function(id,username){
		res.render('main', {title: 'Main Dashboard'});
	});
});

router.get('/getschedules', function(req,res,next){
	Authorize(req,res,next,function(id,username){
		var post_data = querystring.stringify({
				accid: accid,
				acckey: acckey,
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
					post2_data = querystring.stringify({
						accid: accid,
						acckey: acckey,
						cmd: 'getScheduledTimeNow',
						isp: 1
					});
					post2_options = {
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
						post2_res.on('data',function(chunk2){
							parseString(chunk2, function(err2, result2){
								post3_data = querystring.stringify({
									accid: accid,
									acckey: acckey,
									cmd: 'getMembers'
								});
								post3_options = {
									host: 'secure2.aladtec.com',
									port: 443,
									path: '/wrva/xmlapi.php',
									method: 'POST',
									headers: {
										'Content-Type': 'application/x-www-form-urlencoded',
										'Content-Length': Buffer.byteLength(post3_data)
									}						
								}
								var post3_req = https.request(post3_options, function(post3_res){
									post3_res.setEncoding('utf8');
									post3_res.on('data', function(chunk3){
										parseString(chunk3, function(err3, result3){
											crews = [];
											positions = [];
											members = [];
											schedules = []
											//chunk = schedule id's
											//chunk3 = member id's
											//chunk2 = schedule with id's
											//extract crews and positions
											if(result.results.hasOwnProperty("schedules")){
												result.results.schedules[0].schedule.forEach(function(schedule,index){
													crews.push({id: schedule['$'].id,name: schedule.name[0]});
													schedule.positions[0].position.forEach(function(position, index2){
														positions.push({id: position['$'].id, name: position.name[0]});
													});
												});
											}
											//extract members and id's
											if(result3.results.hasOwnProperty("members")){
												result3.results.members[0].member.forEach(function(member,index){
													members.push({id: member['$'].id, name: member.name[0]});
												});
											}	
											//extract schedule and assign names to crews
											if(result2.results.hasOwnProperty("schedules")){
												result2.results.schedules[0].schedule.forEach(function(schedule,index){
													//get crew members and positions
													mems = [];
													schedule.positions[0].position.forEach(function(position){
														name = '';
														positions.forEach(function(pos){
															if(pos.id==position['$'].id) name = pos.name;
														});
														membername = '';
														if(position.member){
															members.forEach(function(member){
																if(member.id==position.member[0]['$'].id) membername = member.name;
															});
														}
														mems.push({position: name, member: membername});
													});

													//get crew name
													name = '';
													crews.forEach(function(crew){
														if(crew.id==schedule['$'].id) name = crew.name;
													});
													schedules.push({name: name, members: mems});
												});
											}
											//build html
											finalhtml = '';
											schedules.forEach(function(schedule){
												finalhtml = finalhtml + '<h4>' + schedule.name + '</h4>';
												finalhtml = finalhtml + '<ul>';
												schedule.members.forEach(function(member){
													finalhtml = finalhtml + '<li><b>' + member.position + '</b>: ' + member.member+'</li>';
												});
												finalhtml = finalhtml + '</ul>';
											});
											res.send(finalhtml);
										});
									});
								});
								post3_req.write(post3_data);
								post3_req.end();
							});
						});
					});
					post2_req.write(post2_data);
					post2_req.end();
				});
			});
		});
		post_req.write(post_data);
		post_req.end();
	});
});

router.get('/getalerts',function(req,res,next){
	Authorize(req,res,next,function(id,username){
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
				finalhtml = '';
				alerts.forEach(function(item){
					finalhtml = finalhtml + '<div class="alert"><b>' + item.alerttext + '</b></div>';
				});
				res.send(finalhtml);
			});
		});
	});
});

router.get('/gettasks', function(req,res,next){
	Authorize(req,res,next,function(id,username){
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
				finalhtml = '<ol>';
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
						finalhtml = finalhtml + '<li><b>' + item.title + '</b></li>';
					}
				});
				finalhtml = finalhtml + '</ol>';
				res.send(finalhtml);
			});
		});
	});
});

router.get('/gettrucks',function(req,res,next){
	Authorize(req,res,next,function(id,username){
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err,client,done){
			console.log('connection complete');
			statusentries = [];
			trucks = [];
			if(err){
				console.error('could not connect to postgres', err);
			}
			var query = client.query("select Trucks.TruckName,Trucks.TruckID,TruckStatusEntries.Status,TruckStatusEntries.StatusTime from Trucks,TruckStatusEntries,Runs where Trucks.TruckID = Runs.TruckID and TruckStatusEntries.RunID = Runs.RunID order by Trucks.TruckName;");
			query.on('row', function(row2){
				//console.log(row);
				statusentries.push(row2);
			});
			query.on('error', function(error){
				console.log(error);
				res.render('invalid', {title: 'Error', message: error});
			});
			query.on('end', function(results2){
				done();
				finalhtml="";
				statusentries.forEach(function(status){
					present = false;
					//check if truck is already in trucks
					//if not add
					trucks.forEach(function(truck){
						if(truck.id == status.truckid) {
							present = true;
						}
					});
					//if truck 
					if(present==false){
						trucks.push({id: status.truckid, name: status.truckname, status: status.status});
					}
				});
				trucks.forEach(function(truck){
					status = ''
					if(truck.status=='service') status = 'In Service';
					if(truck.status=='clear') status = 'Cleared';
					if(truck.status=='arrived') status = 'At Destination';
					if(truck.status=='transport') status = 'Transporting';
					if(truck.status=='onscene') status = 'On Scene';
					if(truck.status=='responding') status = 'Responding';
					finalhtml = finalhtml + '<div>' + truck.name +'<div class="mainstatus">'+status+'</div></div>';
				});
				console.log(finalhtml);
				res.send(finalhtml);
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
			var query2 = client2.query("select CallEntryID,s2.StatusTime timeofcall,s1.StatusTime timeinservice, CallEntries.RunID, TruckName, CallType, CallLocation, CallDestination, DriverName, PrimaryCare, AdditionalNames, RunNumber from CallEntries,(select * from TruckStatusEntries where Status = 'responding') s2,(select * from TruckStatusEntries where Status = 'service') s1,(select TruckName,Runs.RunID from Trucks,Runs where Trucks.TruckID = Runs.TruckID) s3 where CallEntries.RunID = s1.RunID and CallEntries.RunID = s2.RunID and CallEntries.RunID = s3.RunID order by RunNumber desc limit 6;");
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
				finalhtml = "";
				finalhtml = finalhtml + "<table id='callentrylog'>";
				finalhtml = finalhtml + "<tr>";
				finalhtml = finalhtml + "<th>" + "Time of Call" + "</th>";
				finalhtml = finalhtml + "<th>" + "Time in Service" + "</th>";
				finalhtml = finalhtml + "<th>" + "Truck" + "</th>";
				finalhtml = finalhtml + "<th>" + "Call Type" + "</th>";
				finalhtml = finalhtml + "<th>" + "Call Location" + "</th>";
				finalhtml = finalhtml + "<th>" + "Call Destination" + "</th>";
				finalhtml = finalhtml + "<th>" + "Driver Name" + "</th>";
				finalhtml = finalhtml + "<th>" + "Primary Care" + "</th>";
				finalhtml = finalhtml + "<th>" + "Additional Names" + "</th>";
				finalhtml = finalhtml + "<th>" + "Run Number" + "</th>";
				finalhtml = finalhtml + "</tr>";
				callentries.forEach(function(callentry){
					finalhtml = finalhtml + "<tr>";
					finalhtml = finalhtml + "<td>" + callentry.timeofcall.toJSON().replace(/-/g,'/').replace(/T/g,' ').replace(/:\d\d.\d\d\dZ/g,'') + "</td>";
					finalhtml = finalhtml + "<td>" + callentry.timeinservice.toJSON().replace(/-/g,'/').replace(/T/g,' ').replace(/:\d\d.\d\d\dZ/g,'') + "</td>";
					finalhtml = finalhtml + "<td>" + callentry.truckname + "</td>";
					finalhtml = finalhtml + "<td>" + callentry.calltype + "</td>";
					finalhtml = finalhtml + "<td>" + callentry.calllocation + "</td>";
					finalhtml = finalhtml + "<td>" + callentry.calldestination + "</td>";
					finalhtml = finalhtml + "<td>" + callentry.drivername + "</td>";
					finalhtml = finalhtml + "<td>" + callentry.primarycare + "</td>";
					finalhtml = finalhtml + "<td>" + callentry.additionalnames + "</td>";
					finalhtml = finalhtml + "<td>" + callentry.runnumber + "</td>";
					finalhtml = finalhtml + "</tr>";
				});
				finalhtml = finalhtml + "</table>";
				res.send(finalhtml);
			});
		});		
	});
});
module.exports = router;