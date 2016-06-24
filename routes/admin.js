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

/*Main Page of the admin app*/
router.get('/', function(req, res, next){
	AdminAuthorize(req,res,next,function(auth,username){
		res.render('admin', {title: 'Admin Page'});
	});
});

router.get('/addtruck', function(req,res,next){
	AdminAuthorize(req,res,next,function(auth,username){	
		res.render('addtruck', {title: 'Add a Truck'};
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
				res.render('deletetruck', {title: 'Remove Truck?',truck: truck};
			});
		});
	});
});

router.post('/deletetruck', function(req,res,next){
	DeleteTruck(req,res,next,function(message){
		res.render('admin',{title: ' Admin', message: message});
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
		res.render('admin',{title: 'Admin',message: message});
	});
});
module.exports = router;