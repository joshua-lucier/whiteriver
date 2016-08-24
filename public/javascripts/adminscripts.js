//lists trucks under #trucklist div
function listtrucks(callback){
	$.get("/admin/gettrucks", function(data,status){
		$("#trucklist").html(data);
		callback();
	});
}

//lists tasks under #tasklist div
function listtasks(callback){
	$.get("/admin/gettasks", function(data,status){
		$("#tasklist").html(data);
		callback();
	});
}

//lists alerts under #alertlist div
function listalerts(callback){
	$.get("/admin/getalerts", function(data,status){
		$("#alertlist").html(data);
		callback();
	});
}

//lists Current tasks under todaystasks div
function todaystasks(callback){
	$.get("/admin/todaystasks", function(data,status){
		$("#todaystasks").html(data);
		callback();
	});
}

//lists current alerts
function todaysalerts(callback){
	$.get("/admin/todaysalerts", function(data,status){
		$("#todaysalerts").html(data);
		callback();
	});
}

//generates the list of users to mark as admins or exclude from lists
function listadmins(callback){
	$.get("/admin/getadmins", function(data,status){
		$("#adminlist").html(data);
		callback();
	});
}

//this contracts the admins list
function clearadmins(callback){
	$("#adminlist").html('+');
	callback();
}

//determines if the admin list is expanded or not
function toggleadminlist(callback){
	if($("#adminlist").html() == '+'){
		listadmins(function(){
			callback();
		});
	} else {
		clearadmins(function(){
			callback();
		});
	}
}

//displays the admin list on load page
function displayadmin(callback){
	if($("#adminlist").html()=='+'){
		clearadmins(function(){
			callback();
		});
	} else {
		listadmins(function(){
			callback();
		});
	}
}

//Called when page first comes up.  Displays all content
function loadpage(callback){
	listtasks(function(){
		todaystasks(function(){
			listtrucks(function(){
				listalerts(function(){
					todaysalerts(function(){
						displayadmin(function(){
						});
					});
				});
			});
		});
	});
}

//calls load page
$("body").ready(function(){
	loadpage(function(){});
});

//creates task interval which calls load page every 30 seconds
tasklistinterval = setInterval(function(){
	loadpage(function(){});
}, 30000);

//toggles a check mark under task list
function togglemark(id){
	togglemarky = "/admin/togglemark?taskid=" + id;
	$.get(togglemarky,function(data,status){
		listtasks(function(){
			todaystasks(function(){});
		});
	});
}

//toggles admin mark
function toggleadmin(id){
	toggleadminy = "/admin/toggleadmin?memberid=" + id;
	$.get(toggleadminy,function(data,status){
		displayadmin(function(){});
	});
}

//toggles exclusion mark
function toggleexclude(id){
	toggleexcludey = "/admin/toggleexclude?memberid=" + id;
	$.get(toggleexcludey,function(data,status){
		displayadmin(function(){});
	});
}


