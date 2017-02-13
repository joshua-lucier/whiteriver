/*******************************************************************************************************//**
*	\file database.js
*	\brief The back end scripts for the database app
*	\details This script is used for the database app.
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
DatabaseInit = require('./functions').DatabaseInit;
DatabaseClear = require('./functions').DatabaseClear;

//renders main page of the database management app
router.get('/', function(req, res, next) {
	AppDevAuthorize(req,res,next,function(auth,username){
		res.render('manage', {title: 'Database Management'});
	});
});

//initializes the database with new tables
router.get('/init', function(req,res,next){
	DatabaseInit(req,res,next,function(message){
		res.render('manage', {title: 'Database Management', message: message});
	});
});

//deletes all the tables in the database
router.get('/clear', function(req,res,next){
	DatabaseClear(req,res,next,function(message){
		res.render('manage', {title: 'Database Management', message: message});
	});
});

module.exports = router;