/*******************************************************************************************************//**
*	\file logout.js
*	\brief Holds the logout script
*	\details Holds the logout script
*   \author Joshua Lucier
*	\version 0.1
*	\date September 30, 2016
*	\pre Must have working API
*	\bug API and Database server can only handle syncronous ajax requests.  Async will overload.
*	\copyright MIT License
***********************************************************************************************************/

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
Authenticate = require('./functions').Authenticate;

//Logout script clears all cookies and clear the user's encrypted token
router.get('/', function(req,res,next){
	//delete tokens associated with account
	var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
	pg.connect(connectionString, function(err,client,done){
		if(err){
			return console.error('could not connect to postgres', err);
		}
		token = {};
		var query = client.query("delete from Tokens where UserName=$1",[req.cookies.username]);
		query.on('row', function(row){
			//console.log(row);
			token = row;
		});
		query.on('error', function(error){
			console.log(error);
			res.render('invalid', {title: 'Error', message: error});
		});
		query.on('end', function(results){
			done();
			//clear cookies
			res.clearCookie('lasttruck', {path: '/'});
			res.clearCookie('username', {path: '/'});
			res.clearCookie('password', {path: '/'});
			res.clearCookie('page', {path: '/'});
			res.clearCookie('data', {path: '/'});
			res.clearCookie('url', {path: '/'});
			res.clearCookie('key', {path: '/'});
			res.clearCookie('encrypted',{path: '/'});
			res.render('logout',{title: 'Login'});
		});
	});

});

module.exports = router;