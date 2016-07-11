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
					if(status.status=='responding') finalhtml = finalhtml + " <a onClick='responding("+truckid+",function(){})'><b><u>Responding</u></b></a> ";
					else finalhtml = finalhtml + " <a onClick='responding("+truckid+",function(){})'>Responding</a>";
					if(status.status=='onscene') finalhtml = finalhtml + " <b><u><a onClick='onscene("+truckid+",function(){})'>On Scene</a></u></b> ";
					else finalhtml = finalhtml + " <a onClick='onscene("+truckid+",function(){})'>On Scene</a> ";
					if(status.status=='transport') finalhtml = finalhtml + " <b><u><a onClick='transporting("+truckid+",function(){})'>Transporting</a></u></b> ";
					else finalhtml = finalhtml + " <a onClick='transporting("+truckid+",function(){})'>Transporting</a> ";
					if(status.status=='arrived') finalhtml = finalhtml + " <b><u><a onClick='arrived("+truckid+",function(){})'>At Destination</a></u></b> ";
					else finalhtml = finalhtml + " <a onClick='arrived("+truckid+",function(){})'>At Destination</a> ";
					if(status.status=='clear') finalhtml = finalhtml + " <b><u><a onClick='clearrun("+truckid+",function(){})'>Clear</a></u></b> ";
					else finalhtml = finalhtml + " <a onClick='clearrun("+truckid+",function(){})'>Clear</a> ";
					if(status.status=='service') finalhtml = finalhtml + " <b><u><a onClick='service("+truckid+",function(){})'>In Service</a></u></b> ";
					else finalhtml = finalhtml + " <a onClick='service("+truckid+",function(){})'>In Service</a> ";
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
	truckid = req.query.truckid;
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
				console.log(truckid);
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
							if(run){
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
							}

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
		openrun = false;
		statusentry = false;
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
				res.send("Could not get runs" + error2);
			});
			query2.on('end', function(results2){
				if(openrun){ //there is an open run
					var query3 = client2.query("select * from TruckStatusEntries where RunID = $1 and Status = 'onscene';",[openrun.runid])
					query3.on('row', function(row3){
						statusentry = row3;
					});
					query3.on('error', function(error2){
						res.send("Could not get Truckstatusentries" + error2);
					});
					query3.on('end', function(results3){
						if(statusentry){
							res.send('Already went on scene once this call');
							done2();
						} else {
							var query4 = client2.query("insert into TruckStatusEntries(RunID,Status,MemberName) values($1,$2,$3);",[openrun.runid,'onscene',username]);
							query4.on('error',function(error2){
								res.send("Could not insert into truckstatusentries" + error2);
							});
							query4.on('end',function(results){
								res.send("Added truck status entry");
							});
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

router.get('/transporting',function(req,res,next){
	Authorize(req,res,next,function(id,username){
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		truckid = req.query.truckid;
		openrun = false;
		statusentry = false;		
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
				res.send("Could not get runs" + error2);
			});
			query2.on('end', function(results2){
				if(openrun){ //there is an open run
					var query3 = client2.query("select * from TruckStatusEntries where RunID = $1 and Status = 'transport';",[openrun.runid])
					query3.on('row', function(row3){
						statusentry = row3;
					});
					query3.on('error', function(error2){
						res.send("Could not get Truckstatusentries" + error2);
					});
					query3.on('end', function(results3){
						if(statusentry){
							res.send('Already transported once this call');
							done2();
						} else {
							var query4 = client2.query("insert into TruckStatusEntries(RunID,Status,MemberName) values($1,$2,$3);",[openrun.runid,'transport',username]);
							query4.on('error',function(error2){
								res.send("Could not insert into truckstatusentries" + error2);
							});
							query4.on('end',function(results){
								res.send("Added truck status entry");
							});
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

router.get('/arrived',function(req,res,next){
	Authorize(req,res,next,function(id,username){
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		truckid = req.query.truckid;
		openrun = false;
		statusentry = false;		
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
				res.send("Could not get runs" + error2);
			});
			query2.on('end', function(results2){
				if(openrun){ //there is an open run
					var query3 = client2.query("select * from TruckStatusEntries where RunID = $1 and Status = 'arrived';",[openrun.runid])
					query3.on('row', function(row3){
						statusentry = row3;
					});
					query3.on('error', function(error2){
						res.send("Could not get Truckstatusentries" + error2);
					});
					query3.on('end', function(results3){
						if(statusentry){
							res.send('Already arrived once this call');
							done2();
						} else {
							var query4 = client2.query("insert into TruckStatusEntries(RunID,Status,MemberName) values($1,$2,$3);",[openrun.runid,'arrived',username]);
							query4.on('error',function(error2){
								res.send("Could not insert into truckstatusentries" + error2);
							});
							query4.on('end',function(results){
								res.send("Added truck status entry");
							});
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

router.get('/clear',function(req,res,next){
	Authorize(req,res,next,function(id,username){
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		truckid = req.query.truckid;
		openrun = false;
		statusentry = false;		
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
				res.send("Could not get runs" + error2);
			});
			query2.on('end', function(results2){
				if(openrun){ //there is an open run
					var query3 = client2.query("select * from TruckStatusEntries where RunID = $1 and Status = 'clear';",[openrun.runid])
					query3.on('row', function(row3){
						statusentry = row3;
					});
					query3.on('error', function(error2){
						res.send("Could not get Truckstatusentries" + error2);
					});
					query3.on('end', function(results3){
						if(statusentry){
							res.send('Already cleared once this call');
							done2();
						} else {
							var query4 = client2.query("insert into TruckStatusEntries(RunID,Status,MemberName) values($1,$2,$3);",[openrun.runid,'clear',username]);
							query4.on('error',function(error2){
								res.send("Could not insert into truckstatusentries" + error2);
							});
							query4.on('end',function(results){
								res.send("Added truck status entry");
							});
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

router.get('/service',function(req,res,next){
	Authorize(req,res,next,function(id,username){
		var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
		truckid = req.query.truckid;
		openrun = false;
		statusentry = false;		
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
				res.send("Could not get runs" + error2);
			});
			query2.on('end', function(results2){
				if(openrun){ //there is an open run
					var query3 = client2.query("select * from TruckStatusEntries where RunID = $1 and Status = 'service';",[openrun.runid])
					query3.on('row', function(row3){
						statusentry = row3;
					});
					query3.on('error', function(error2){
						res.send("Could not get Truckstatusentries" + error2);
					});
					query3.on('end', function(results3){
						if(statusentry){
							res.send('Call already closed');
							done2();
						} else {
							var query4 = client2.query("insert into TruckStatusEntries(RunID,Status,MemberName) values($1,$2,$3);",[openrun.runid,'service',username]);
							query4.on('error',function(error2){
								res.send("Could not insert into truckstatusentries" + error2);
							});
							query4.on('end',function(results){
								var query5 = client2.query("update Runs set Status=false where RunID=$1;",[openrun.runid]);
								query5.on('error', function(error2){
									res.send("Could not update Runs" + error2);
								});
								query5.on('end', function(results4){
									res.send("Closed out Run");
								});
							});
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