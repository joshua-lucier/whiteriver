function listtrucks(callback){
	$.get("/admin/gettrucks", function(data,status){
		$("#trucklist").html(data);
		callback();
	});
}

function listtasks(callback){
	$.get("/admin/gettasks", function(data,status){
		$("#tasklist").html(data);
		callback();
	});
}

function listalerts(callback){
	$.get("/admin/getalerts", function(data,status){
		$("#alertlist").html(data);
		callback();
	});
}

function todaystasks(callback){
	$.get("/admin/todaystasks", function(data,status){
		$("#todaystasks").html(data);
		callback();
	});
}

function todaysalerts(callback){
	$.get("/admin/todaysalerts", function(data,status){
		$("#todaysalerts").html(data);
		callback();
	});
}

function listadmins(callback){
	$.get("/admin/getadmins", function(data,status){
		$("#adminlist").html(data);
		callback();
	});
}

function clearadmins(callback){
	$("#adminlist").html('+');
	callback();
}

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

$("body").ready(function(){
	loadpage(function(){});
});
tasklistinterval = setInterval(function(){
	loadpage(function(){});
}, 30000);

function togglemark(id){
	togglemarky = "/admin/togglemark?taskid=" + id;
	$.get(togglemarky,function(data,status){
		listtasks(function(){
			todaystasks(function(){});
		});
	});
}

function toggleadmin(id){
	toggleadminy = "/admin/toggleadmin?memberid=" + id;
	$.get(toggleadminy,function(data,status){
		displayadmin(function(){});
	});
}

function toggleexclude(id){
	toggleexcludey = "/admin/toggleexclude?memberid=" + id;
	$.get(toggleexcludey,function(data,status){
		displayadmin(function(){});
	});
}


