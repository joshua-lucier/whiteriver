sqldelay = 500;


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

function todaysaelerts(callback){
	$.get("/admin/todaysalerts", function(data,status){
		$("#todaysalerts").html(data);
		callback();
	});
}

function loadpage(callback){
	listtasks(function(){
		todaystasks(function(){
			listtrucks(function(){
				listalerts(function(){
					todaysalerts(function(){});
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
	$.get("/admin/togglemark?taskid="+id,function(data,status){
		listtasks(function(){
			todaystasks(function(){});
		});
	});
}
