sqldelay = 750;


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


$("body").ready(listtasks());
tasklistinterval = setInterval(listtasks(), 60000);

$("body").ready(setTimeout(listtrucks(), sqldelay));
trucklistinterval = setInterval(setTimeout(listtrucks(), sqldelay), 60000);


console.log('input');
function togglemark(id){
	$.get("/admin/togglemark?taskid="+id,function(data,status){
		listtasks();
	});
}

$("body").ready(function(){
	console.log('input');
	if(!$("input").val()){
		console.log('input');
		$(this).parents('label').append('<span class="message">Empty!!</span>');
	}
});