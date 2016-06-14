var express = require('express');
var router = express.Router();

//Input:  page that you want to enter on authentication
//Output: 0 for invalid login
function CheckLogin(page, data, req, res){
	login = false;
	if(req.session.userid){
		//post to /authenticate the req.session.userid and req.session.password
		//if /authenticate returns 0 then login=false else 1 then login=true
	}
	else{
		//render login page with page as page
	}
	return login;
}

function CheckGroup(){
	admin = false;
	//check group that id is in by using a post to the api
	return admin;
}

function Render(page, data, req, res){
	login = CheckLogin(page, req, res);
	if (login) res.render(page,data);
	else res.render('invalid');
}

function AdminRender(page, data, req,res){
	login = CheckLogin(page, req, res);
	admin = CheckGroup();
	if (login && admin) res.render(page,data);
	else res.render('invalid');
}

router.post('/authenticate', function(req, res, next){
	authenticated = false;
	//check userid and password against api.  
	//If it returns valid; authenticated = true and store cookies  req.session.userid req.session.password
	return authenticated;
});

router.post('/login', function(req,res,next){
	//accept credentials from login template, check against api and store cookies
	//pass to correct template with req.page and req.data
	res.render(req.page,req.data);
});

/* GET home page.  This page selects which app your in. */
router.get('/', function(req, res, next) {
	Render('index', {title: 'Index'}, req, res);
});

/*Main Page of the admin app*/
router.get('/admin', function(req, res, next){
	AdminRender('admin',{title: 'Admin'},req,res);
});

/*Main Page of the mobile app*/
router.get('/mobile', function(req,res,next){
	Render('mobile', {title: 'mobile'}, req, res);
});

/*Main Page of the main display app*/
router.get('/main', function(req,res,next){
	Render('main', {title: 'main'}, req, res);
});

router.get('/truck' function(req,res,next){
	truckid = req.query.truckid;
	truck = {}; //truck information from the database
	Render('truck', {title: 'Truck ' + truckid, truck: truck});
});
module.exports = router;
