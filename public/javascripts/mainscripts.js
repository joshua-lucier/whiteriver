function currentcrew(callback){
	$.get("/main/getschedules", function(data,status){
		$("#currentcrew").html(data);
		callback();
	});
}

function currentalerts(callback){
	$.get("/main/getalerts", function(data,status){
		$("#currentalerts").html(data);
		callback();
	});
}


function loadmainpage(callback){
	currentcrew(function(){
		currentalerts(function(){});
	});
}

$("body").ready(function(){
	loadmainpage(function(){});
});