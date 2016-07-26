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

function callentrytable(callback){
	$.get("/main/callentrytable", function(data,status){
		$("#callentrytablediv").html(data);
		callback();
	});
}


function loadmainpage(callback){
		currentalerts(function(){
			currenttasks(function(){
				currenttrucks(function(){
					callentrytable(function(){
						updateTimeDate();
						callback();
					});
				});
			});
		});
}

$("body").ready(function(){
	loadmainpage(function(){
		currentcrew(function(){});
	});
});

listinterval = setInterval(function(){
	loadmainpage(function(){});
}, 10000);

crewinterval = setInterval(function(){
	currentcrew(function(){});
},300000);

function updateTimeDate(){
	date = new Date();
	month = [];
	month[0] = "January";
	month[1] = "February";
	month[2] = "March";
	month[3] = "April";
	month[4] = "May";
	month[5] = "June";
	month[6] = "July";
	month[7] = "August";
	month[8] = "September";
	month[9] = "October";
	month[10] = "November";
	month[11] = "December";
	day = [];
	day[0] = "Sunday";
	day[1] = "Monday";
	day[2] = "Tuesday";
	day[3] = "Wednesday";
	day[4] = "Thursday";
	day[5] = "Friday";
	day[6] = "Saturday";
	//$("#dater").html(date.getDay()+" "+month[date.getMonth()]+","+date.getFullYear());
	$("#dater").html(date.toLocaleDateString());
	$("#dayr").html(day[date.getUTCDay()]);
	//$("#timer").html(date.getHours()+":"+date.getMinutes().toFixed(2));
	$("#timer").html(date.toLocaleTimeString());
}