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
											result.results.schedules[0].schedule.forEach(function(schedule,index){
												crews.push({id: schedule['$'].id,name: schedule.name[0]});
												schedule.positions[0].position.forEach(function(position, index2){
													positions.push({id: position['$'].id, name: position.name[0]});
												});
											});
											//extract members and id's
											result3.results.members[0].member.forEach(function(member,index){
												members.push({id: member['$'].id, name: member.name[0]});
											});
											//extract schedule and assign names to crews
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

module.exports = router;