var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var express = require('express');
var querystring = require('querystring');
var https = require('https');
var router = express.Router();
var secret = process.env.secret;
var accid = process.env.accid;
var key = process.env.key;
var parseString = require('xml2js').parseString;
router.use(cookieParser(secret));
router.use(cookieSession({
  name: 'whiteriver',
  keys: [secret]
}));
AdminAuthenticate = require('./functions').AdminAuthenticate;
AddTruck = require('./functions').AddTruck;
GetTrucks = require('./functions').GetTrucks;

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

module.exports = router;