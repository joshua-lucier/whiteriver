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
var parseString = require('xml2js').parseString;
var pg = require('pg');
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
	GetTrucks(req,res,next);
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
			AdminAuthorize(req,res,next,function(auth,username){
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
			AdminAuthorize(req,res,next,function(auth,username){
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
	AdminAuthorize(req,res,next,function(auth,username){
		id = auth.results.authentication[0].member[0]['$'].id;
		names = [];
		ids = [];
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
				
				parseString(chunk2, function(err2, result2){
					creatorname = '';
					//console.log(result2.results.members[0].member[0]['$'].id);
					//console.log(result2.results.members[0].member[0].name[0]);
					//extract the name of the user from result2
					result2.results.members[0].member.forEach(function(item){
						ids.push(item['$'].id);
						names.push(item.name[0]);
					});
					res.render('addtask',{title: 'Add Task',id: id,ids: ids, names: names});
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
module.exports = router;