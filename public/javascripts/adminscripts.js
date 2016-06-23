function listtrucks(){
	$.get("/admin/gettrucks", function(data,status){
		$("#trucklist").html(data);
	});
}

$("body").ready(listtrucks());
trucklistinterval = setInterval(listtrucks, 60000);