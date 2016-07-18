function currentcrew(callback){
	$.get("/main/getschedules", function(data,status){
		$("#currentcrew").html(data);
		callback();
	});
}


function loadmainpage(callback){
	currentcrew(function(){});
}

$("body").ready(function(){
	loadmainpage(function(){});
});