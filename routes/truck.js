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

router.get('/', function(req,res,next){
	truckid = req.query.truckid;
	truck = {}; //truck information from the database
	Authorize(req,res,next,function(id,username){
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err3,client2,done2){
			console.log('connection complete');
			if(err3){
				console.error('could not connect to postgres', err);
			}
			var query2 = client2.query("select * from Trucks where TruckID=$1;",[truckid]);
			query2.on('row', function(row2){
				//console.log(row);
				truck = row2;
			});
			query2.on('error', function(error2){
				res.render('invalid',{title: 'Invalid', message: error2});
			});
			query2.on('end', function(results2){
				done2();
				res.render('truck',{title: truck.truckname, truck: truck});
			});
		});
	});
});

router.get('/getstatus', function(req,res,next){
	truckid = req.query.truckid;
	status = {};
	Authorize(req,res,next,function(id,username){
		//find last status posted
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err3,client2,done2){
			console.log('connection complete');
			if(err3){
				console.error('could not connect to postgres', err);
			}
			var query2 = client2.query("SELECT TruckStatusEntries.Status FROM TruckStatusEntries,Runs WHERE TruckStatusEntries.RunID = Runs.RunID and Runs.TruckID = $1 ORDER BY TruckStatusEntries.StatusTime DESC LIMIT 1;",[truckid]);
			query2.on('row', function(row2){
				//console.log(row);
				status = row2;
			});
			query2.on('error', function(error2){
				console.log(error2);
				res.send(error2);
			});
			query2.on('end', function(results2){
				done2();
				if(status) {
					finalhtml ="<div>";
					if(status.status=='responding') finalhtml = finalhtml + " <a onClick='responding("+truckid+",function(){})'><b>Responding</b></a> ";
					else finalhtml = finalhtml + " <a onClick='responding("+truckid+",function(){})'>Responding</a>";
					if(status.status=='onscene') finalhtml = finalhtml + " <b>On Scene</b> ";
					else finalhtml = finalhtml + " On Scene ";
					if(status.status=='transporting') finalhtml = finalhtml + " <br>Transporting</b> ";
					else finalhtml = finalhtml + " Transporting ";
					if(status.status=='atdestination') finalhtml = finalhtml + " <b>At Destination</b> ";
					else finalhtml = finalhtml + " At Destination ";
					if(status.status=='clear') finalhtml = finalhtml + " <b>Clear</b> ";
					else finalhtml = finalhtml + " Clear ";
					if(status.status=='inservice') finalhtml = finalhtml + " <br>In Service</b> ";
					else finalhtml = finalhtml + " In Service ";
					res.send(finalhtml);
				} else {
					finalhtml ="Responding  On Scene  Transporting  At Destination  Clear  In Service";
					res.send(finalhtml + ' No previous status entry');
				}
			});
		});
	});
});

router.get('/responding',function(req,res,next){
	truckid = req.query.status;
	openrun = false;
	run = false;
	Authorize(req,res,next,function(id,username){
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err3,client2,done2){
			console.log('connection complete');
			if(err3){
				console.error('could not connect to postgres', err);
			}
			var query2 = client2.query("select * from Runs where TruckID=$1 and Status=true;",[truckid]); //if there is an open run
			query2.on('row', function(row2){
				//console.log(row);
				openrun = row2;
			});
			query2.on('error', function(error2){
				console.log(error2);
				res.send(error2);
			});
			query2.on('end', function(results2){
				if(openrun){
					console.log(openrun);
					done2();
					res.send("Run Already Started");
				}
				else {
					var query3 = client2.query("insert into Runs(TruckID,Status) values($1,true);",[truckid]);
					query3.on('error', function(error2){
						console.log('Error on Run insert');
						console.log(error2);
						res.send(error2);
					});
					query3.on('end',function(results3){
						query4 = client2.query("select * from Runs where TruckID=$1 and Status=true;",[truckid]);
						query4.on('row', function(row3){
							run = row3;
						});
						query4.on('error', function(error){
							console.log(error);
							res.send(error);
						});
						query4.on('end', function(results4){
							query5 = client2.query("insert into TruckStatusEntries(RunID, Status, MemberName) values ($1,$2,$3)",[run.runid,'responding',username]);
							query5.on('error', function(error){
								console.log('Error on TruckStatusEntries Insert');
								console.log(error);
								res.send(error);
							});
							query5.on('end', function(results5){
								done2();
								res.send('New Call Initiated.')
							});
						});
					});
				}
			});
		});
	});
});

router.get('/onscene',function(req,res,next){
	Authorize(req,res,next,function(id,username){
		truckid = req.query.truckid;
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		pg.connect(connectionString, function(err3,client2,done2){
			console.log('connection complete');
			if(err3){
				console.error('could not connect to postgres', err);
			}
			var query2 = client2.query("select * from Runs where TruckID=$1, Status=true;",[truckid]); //if there is an open run
			query2.on('row', function(row2){
				//console.log(row);
				openrun = row2;
			});
			query2.on('error', function(error2){
				res.send(error2);
			});
			query2.on('end', function(results2){
				if(openrun){ //there is an open run
					var query3 = client2.query("select * from TruckStatusEntries where RunID = $1, Status = 'onscene';",[openrun.runid])
					query3.on('row', function(row3){
						statusentry = row3;
					});
					query3.on('error', function(error2){
						res.send(error2);
					});
					query3.on('end', function(results2){
						if(statusentry){
							res.send('Already went on scene once this call');
							done2();
						} else {
							var query4 = client2.query("insert into TruckStatusEntries(RunID,Status,MemberName) values($1,$2,$3);",[openrun.runid,'onscene',username]);
						}
					});
				} else {
					res.send('Please begin a run first');
					done2();
				}
			});
		});
	});
});
module.exports = router;