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
AdminAuthenticate = require('./functions').AdminAuthenticate;
AddTruck = require('./functions').AddTruck;
GetTrucks = require('./functions').GetTrucks;
DeleteTruck = require('./functions').DeleteTruck;
EditTruck = require('./functions').EditTruck;

/*Main Page of the admin app*/
router.get('/', function(req, res, next){
	AdminAuthenticate('admin',{title: 'Admin'},req,res);
});

router.get('/addtruck', function(req,res,next){
	AdminAuthenticate('addtruck', {title: 'Add a Truck'},req,res);
});

router.post('/finishtruck', function(req,res,next){
	AddTruck('admin',{title: 'Admin'},req,res);
});

router.get('/gettrucks', function(req,res,next){
	GetTrucks(req,res);
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
			AdminAuthenticate('deletetruck', {title: 'Remove Truck?',truck: truck},req,res);
		});
	});
});

router.post('/deletetruck', function(req,res,next){
	DeleteTruck('admin',{title: ' Admin'}, req,res);
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
			AdminAuthenticate('edittruck', {title: 'Edit Truck',truck: truck},req,res);
		});
	});
});

router.post('/edittruck', function(req,res,next){
	EditTruck('Admin',{title: 'Admin'},req,res);
});
module.exports = router;