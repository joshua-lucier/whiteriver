/*Scripts for main dashboard
By Joshua Lucier
MIT Licensed
*/

//Generates current crew
function currentcrew(callback){
	$.get("/main/getschedules", function(data,status){
		$("#currentcrew").html(data);
		callback();
	});
}

//Generates current alerts
function currentalerts(callback){
	$.get("/main/getalerts", function(data,status){
		$("#currentalerts").html(data);
		callback();
	});
}

//Generates current tasks
function currenttasks(callback){
	$.get("/main/gettasks", function(data,status){
		$("#currenttasks").html(data);
		callback();
	});
}

//Generates current truck status
function currenttrucks(callback){
	$.get("/main/gettrucks", function(data,status){
		$("#currenttrucks").html(data);
		callback();
	});
}

//Generates call entry table
function callentrytable(callback){
	$.get("/main/callentrytable", function(data,status){
		$("#callentrytablediv").html(data);
		callback();
	});
}

//Generates all the content for the main page
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

//Calls loadmainpage when page initially opens up
$("body").ready(function(){
	loadmainpage(function(){
		currentcrew(function(){});
	});
});

//sets up an interval timer for main page to refresh every 10 seconds
listinterval = setInterval(function(){
	loadmainpage(function(){});
}, 10000);

//A separate interval timer because the API cannot handle one call every 10 seconds.
crewinterval = setInterval(function(){
	currentcrew(function(){});
},300000);

//This displays the time and date at the top of the main page
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
	$("#timer").html(date.toLocaleTimeString().replace(/:\d\d PM/g,' PM'));
}