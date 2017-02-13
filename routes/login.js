/*******************************************************************************************************//**
*	\file login.js
*	\brief Render functions for authorization function
*	\details This script is used for splash pages on logging in.
*   \author Joshua Lucier
*	\version 0.1
*	\date September 30, 2016
*	\pre Must have working API
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
var parseString = require('xml2js').parseString;
router.use(cookieParser(secret));
router.use(cookieSession({
  name: 'whiteriver',
  keys: [secret]
}));
AppDevAuthorize = require('./functions').AppDevAuthorize;
AdminAuthenticate = require('./functions').AdminAuthenticate;
Authorize = require('./functions').Authorize;

//Redirect to appropriate page on login
router.post('/', function(req,res,next){
	Authorize(req,res,next,function(){
		res.redirect(req.cookies.url);
	});
});

//Redirect to manage app when appdev is logged in
router.post('/appdev', function(req,res,next){
	AppDevAuthorize(req,res,next,function(){
		res.render('manage',{title: 'Manage Database'});
	});
});

//Redirect to admin page when admin is logged in
router.post('/admin', function(req,res,next){
	AdminAuthorize(req,res,next,function(auth){
		res.render('admin',{title: 'Admin'});
	});
});

module.exports = router;