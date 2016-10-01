/*******************************************************************************************************//**
*	\file mainscripts.js
*	\brief A front end script for the main dashboard
*	\details This script is used for the main page.  All functions call ajax requests to update data.
*   \author Joshua Lucier
*	\version 0.1
*	\date September 30, 2016
*	\pre Must have working API
*	\bug API and Database server can only handle syncronous ajax requests.  Async will overload.
*	\copyright MIT License
***********************************************************************************************************/

/** \fn CurrentCrew
*	\brief Displays current crew
*	\param Callback A function that is passed to CurrentCrew
*	\details This function updates the #currentcrew list on the main page by making a call to /main/getschedules
*	\return void
*/
function CurrentCrew(Callback){
	$.get("/main/getschedules", function(Data,Status){
		$("#currentcrew").html(Data);
		Callback();
	});
}

/** \fn CurrentAlerts
*	\brief Displays current alerts
*	\param Callback A function that is passed to CurrentAlerts
*	\details This function updates the #currentalerts list on the main page by making a call to /main/getalerts
*	\return void
*/
function CurrentAlerts(Callback){
	$.get("/main/getalerts", function(Data,Status){
		$("#currentalerts").html(Data);
		Callback();
	});
}

/** \fn CurrentTasks
*	\brief Displays current tasks
*	\param Callback A function that is passed to CurrentTasks
*	\details This function updates the #currenttasks list on the main page by making a call to /main/gettasks
*	\return void
*/
function CurrentTasks(Callback){
	$.get("/main/gettasks", function(Data,Status){
		$("#currenttasks").html(Data);
		Callback();
	});
}

/** \fn CurrentTrucks
*	\brief Displays current trucks and their status
*	\param Callback A function that is passed to CurrentTrucks
*	\details This function updates the #currenttrucks list on the main page by making a call to /main/gettrucks.  It then displays their status.
*	\return void
*/
function CurrentTrucks(Callback){
	$.get("/main/gettrucks", function(Data,Status){
		$("#currenttrucks").html(Data);
		Callback();
	});
}

/** \fn CallEntryTable
*	\brief Displays last 10 call entries
*	\param Callback A function that is passed to CallEntryTable
*	\details This function updates the #callentrytablediv list on the main page with the last 10 call entries by making a call to /main/callentrytable
*	\return void
*/
function CallEntryTable(Callback){
	$.get("/main/callentrytable", function(Data,Status){
		$("#callentrytablediv").html(Data);
		Callback();
	});
}

/** \fn LoadMainPage
*	\brief Loads up the main page
*	\pre The page is loaded and LoadMainPage is called off a ready listener
*	\param Callback A function that is passed to LoadMainPage
*	\details LoadMainPage calls all the display functions except for CurrentCrew and displays information to the main page.
*	\details CurrentCrew is separated to prevent rapid calls to the adaldtec API
*	\return void
*/
function LoadMainPage(Callback){
	CurrentAlerts(function(){
		CurrentTasks(function(){
			CurrentTrucks(function(){
				CallEntryTable(function(){
					UpdateTimeDate();
					Callback();
				});
			});
		});
	});
}
 
/** \fn ready
*	\brief Displays the main page on load
*	\pre The page is loaded and the ready listener is called on the body
*	\param function Calls LoadMainPage and CurrentCrew.
*	\details Calls LoadMainPage and CurrentCrew on the ready listener
*	\details CurrentCrew is separated to prevent rapid calling to the adaldtec API
*	\return void
*/
$("body").ready(function(){
	LoadMainPage(function(){
		CurrentCrew(function(){});
	});
});

/** \fn setInterval
*	\brief Sets up LoadMainPage to run every 10 seconds
*	\var ListInterval Keeps interval object
*	\param function Calls LoadMainPage
*	\details Sets up an interval timer that calls LoadMainPage every 10 seconds.
*	\return void
*/
var ListInterval = setInterval(function(){
	LoadMainPage(function(){});
}, 10000);

/** \fn setInterval
*	\brief Displays current crew every 5 minutes
*	\var CrewInterval Keeps interval object
*	\param function Calls CurrentCrew
*	\details Calls CurrentCrew once every 5 minutes.  This is a safety measure putin place to rprevent rapid updates from tripping adaldtec security measures.
*	\return void
*/
var CrewInterval = setInterval(function(){
	CurrentCrew(function(){});
},300000);

/** \fn UpdateTimeDate
*	\brief Displays current time and date
*	\pre LoadMainPage is called
*	\details Converts numeric date to string date and formats the time accordingly.
*	\details #dater displays the current date
*	\details #dayr displays the current day of the week.  UTCDay uses 0 as Sunday.
*	\details #timer displays the current time in the format HH:MM PM
*	\return void
*/
function UpdateTimeDate(){
	var MyDate = new Date();  ///< Current Date
	var Month = []; ///< Month array that is used to convert numeric date to string format
	Month[0] = "January";
	Month[1] = "February";
	Month[2] = "March";
	Month[3] = "April";
	Month[4] = "May";
	Month[5] = "June";
	Month[6] = "July";
	Month[7] = "August";
	Month[8] = "September";
	Month[9] = "October";
	Month[10] = "November";
	Month[11] = "December";
	var Day = []; ///< Day array that is used to convert numeric day of the week to string format
	Day[0] = "Sunday";
	Day[1] = "Monday";
	Day[2] = "Tuesday";
	Day[3] = "Wednesday";
	Day[4] = "Thursday";
	Day[5] = "Friday";
	Day[6] = "Saturday";
	$("#dater").html(MyDate.toLocaleDateString()); ///< Displays current date
	$("#dayr").html(Day[MyDate.getUTCDay()]);  ///< Displays the string of the current day of the week
	$("#timer").html(MyDate.toLocaleTimeString().replace(/:\d\d PM/g,' PM'));  ///< Displays the time in the format HH:MM PM
}
