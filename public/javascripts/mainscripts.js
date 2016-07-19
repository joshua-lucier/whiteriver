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

function currenttasks(callback){
	$.get("/main/gettasks", function(data,status){
		$("#currenttasks").html(data);
		callback();
	});
}

function currenttrucks(callback){
	$.get("/main/gettrucks", function(data,status){
		$("#currenttrucks").html(data);
		callback();
	});
}


function loadmainpage(callback){
	currentcrew(function(){
		currentalerts(function(){
			currenttasks(function(){
				currenttrucks(function(){
					callback();
				});
			});
		});
	});
}

$("body").ready(function(){
	loadmainpage(function(){});
});

tasklistinterval = setInterval(function(){
	loadmainpage(function(){});
}, 10000);