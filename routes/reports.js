var router = express.Router();
router.use(cookieParser(secret));
router.use(cookieSession({
  name: 'whiteriver',
  keys: [secret]
}));
var secret = process.env.secret;
var accid = process.env.accid;
var acckey = process.env.key;
AdminAuthorize = require('./functions').AdminAuthorize;

router.get('/',function(req,res,next){
	AdminAuthorize(req,res,next,function(id,username){
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
					res.render('selectreport',{title: 'Select Report',ids: ids, names: names});
				});
			});
		});
		post2_req.write(post2_data);
		post2_req.end();
	});
});

router.get('/pie', function(req,res,next){
	
});
