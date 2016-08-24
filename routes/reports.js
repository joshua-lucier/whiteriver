var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var express = require('express');
var querystring = require('querystring');
var https = require('https');
var router = express.Router();
var secret = process.env.secret;
var accid = process.env.accid;
var acckey = process.env.key;
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
AdminAuthorize = require('./functions').AdminAuthorize;

router.get('/',function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
		names = [];
		ids = [];
		exclusions = [];
		trucks = [];
		//Get employee roster
		var post2_data = querystring.stringify({
			accid: accid,
			acckey: acckey,
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
				var connectionString = "postgres:" + pgusername +":" + pgpassword + "@" + pghost +"/" + pgdatabase;
				pg.connect(connectionString, function(err,client,done){
					var query2 = client.query("select * from Exclusions;");
					query2.on('row', function(row){
						exclusions.push(row.memberid);
					});
					query2.on('end', function(results2){
						parseString(chunk2, function(err2, result2){
							creatorname = '';
							//console.log(result2.results.members[0].member[0]['$'].id);
							//console.log(result2.results.members[0].member[0].name[0]);
							//extract the name of the user from result2
							result2.results.members[0].member.forEach(function(item){
								exclusion = false;
								exclusions.forEach(function(exclusionitem){
									if(item['$'].id == exclusionitem) exclusion = true;
								});
								if(!exclusion){
									ids.push(item['$'].id);
									names.push(item.name[0]);
								}
							});
							query3 = client.query("select * from Trucks;");
							query3.on('row', function(row2){
								trucks.push(row2);
							});
							query3.on('end', function(results3){
								res.render('selectreport',{title: 'Select Report',ids: ids, names: names, trucks: trucks});
							});
						});
					});
				});
			});
		});
		post2_req.write(post2_data);
		post2_req.end();
	});
});

router.get('/pie', function(req,res,next){
	
});


module.exports = router;