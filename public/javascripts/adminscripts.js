function listtrucks(){
	$.get("/admin/gettrucks", function(data,status){
		console.log(data);
		$("#trucklist").html(data);
	});
}

function listtasks(){
	$.get("/admin/gettasks", function(data,status){
		$("#tasklist").html(data);
	});
}


$("body").ready(listtasks());
tasklistinterval = setInterval(listtasks(), 60000);

$("body").ready(setTimeout(listtrucks(),750));
trucklistinterval = setInterval(setTimeout(listtrucks(),750), 60000);



function togglemark(id){
	$.get("/admin/togglemark?taskid="+id,function(data,status){
		listtasks();
	});
}