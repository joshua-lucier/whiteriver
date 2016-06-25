function listtrucks(){
	$.get("/admin/gettrucks", function(data,status){
		$("#trucklist").html(data);
	});
}

function listtasks(){
	$.get("/admin/gettasks", function(data,status){
		$("#tasklist").html(data);
	});
}

$("body").ready(listtrucks());
trucklistinterval = setInterval(listtrucks, 60000);

$("body").ready(listtasks());
tasklistinterval = setInterval(listtasks, 60000);