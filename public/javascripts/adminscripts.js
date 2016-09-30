/*******************************************************************************************************//**
*	\file adminscripts.js
*	\brief A front end script for the admin page
*	\details This script is used for the admin page.  All functions call ajax requests to update data.
*   \author Joshua Lucier
*	\version 0.1
*	\date September 30, 2016
*	\pre Must have working API
*	\bug API and Database server can only handle syncronous ajax requests.  Async will overload.
*	\copyright MIT License
***********************************************************************************************************/

/** \fn ListTrucks
*	\brief Displays trucks
*	\param callback A function that is passed to listtrucks
*	\details This function updates the #trucklist list on the admin page by making a call to /admin/gettrucks
*	\return void
*/
function ListTrucks(callback){
	$.get("/admin/gettrucks", function(data,status){
		$("#trucklist").html(data);
		callback();
	});
}

/** \fn ListTasks
*	\brief Displays all tasks
*	\param callback A function that is passed to listtasks
*	\details This function updates the #tasklist list on the admin page by making a call to /admin/gettasks
*	\return void
*/
function ListTasks(callback){
	$.get("/admin/gettasks", function(data,status){
		$("#tasklist").html(data);
		callback();
	});
}

/** \fn ListAlerts
*	\brief Displays all alerts
*	\param callback A function that is passed to listalerts
*	\details This function updates the #alertlist list on the admin page by making a call to /admin/getalerts
*	\return void
*/
function ListAlerts(callback){
	$.get("/admin/getalerts", function(data,status){
		$("#alertlist").html(data);
		callback();
	});
}

/** \fn TodaysTasks
*	\brief Displays current tasks
*	\param callback A function that is passed to todaystasks
*	\details This function updates the #todaystasks list on the admin page by making a call to /admin/todaystasks
*	\return void
*/
function TodaysTasks(callback){
	$.get("/admin/todaystasks", function(data,status){
		$("#todaystasks").html(data);
		callback();
	});
}

/** \fn TodaysAlerts
*	\brief Displays current alerts
*	\param callback A function that is passed to todaysalerts
*	\details This function updates the #todaysalerts list on the admin page by making a call to /admin/todaysalerts
*	\return void
*/
function TodaysAlerts(callback){
	$.get("/admin/todaysalerts", function(data,status){
		$("#todaysalerts").html(data);
		callback();
	});
}

/** \fn ListAdmins
*	\brief Displays all users of the adaldtec system
*	\param callback A function that is passed to ListAdmins
*	\details This function updates the #adminlist list on the admin page by making a call to /admin/getadmins
*	\return void
*/
function ListAdmins(callback){
	$.get("/admin/getadmins", function(data,status){
		$("#adminlist").html(data);
		callback();
	});
}

/** \fn ClearAdmins
*	\brief Replaces the admin list with a +
*	\param callback A function that is passed to ClearAdmins
*	\details This function updates the #adminlist list on the admin page by using the '+' symbol.  Essentially contracts the admin list.
*	\return void
*/
function ClearAdmins(callback){
	$("#adminlist").html('+');
	callback();
}

/** \fn ToggleAdminList
*	\brief Toggles whether or not admin list is expanded or contracted
*	\param callback A function that is passed to ToggleAdminList
*	\details This function calls listadmins or clearadmins based on what is being displayed in #adminlist
*	\return void
*/
function ToggleAdminList(callback){
	if($("#adminlist").html() == '+'){
		listadmins(function(){
			callback();
		});
	} else {
		clearadmins(function(){
			callback();
		});
	}
}

/** \fn DisplayAdmin
*	\brief Toggles whether or not admin list is expanded or contracted
*	\param callback A function that is passed to DisplayAdmin
*	\details This function calls listadmins or clearadmins based on what is being displayed in #adminlist
*	\return void
*/
function DisplayAdmin(callback){
	if($("#adminlist").html()=='+'){
		clearadmins(function(){
			callback();
		});
	} else {
		listadmins(function(){
			callback();
		});
	}
}

/** \fn LoadPage
*	\brief Calls admin functions to display lists
*	\param callback A function that is passed to LoadPage
*	\details This function calls ListTasks, TodaysTasks, ListTrucks, ListAlerts, TodaysAlerts, and DisplayAdmin.  
*	\details It is designed to be called when the admin page first loads.
*	\return void
*/
function LoadPage(callback){
	ListTasks(function(){
		TodaysTasks(function(){
			ListTrucks(function(){
				ListAlerts(function(){
					TodaysAlerts(function(){
						DisplayAdmin(function(){
						});
					});
				});
			});
		});
	});
}

/** \fn ready
*	\brief Calls LoadPage when script is loaded
*	\pre Body is loaded and ready
*	\param function
*	\details This function calls ListTasks, TodaysTasks, ListTrucks, ListAlerts, TodaysAlerts, and DisplayAdmin.  
*	\details It is designed to be called when the admin page first loads.
*	\return void
*/
$("body").ready(function(){
	LoadPage(function(){});
});


/** \fn setInterval
*	\brief Sets up loadpage to run every 30 seconds
*	\pre Script is loaded
*	\param function
*	\details Sets up loadpage to run every 30 seconds
*	\var TaskListInterval
*	\return void
*/
TaskListInterval = setInterval(function(){
	LoadPage(function(){});
}, 30000);  ///< Task interval which calls LoadPage every 30 seconds

/** \fn ToggleMark
*	\brief Checks or unchecks a task
*	\pre A task is checked by the user
*	\param ID The id number of the task that was checked
*	\details Sends a call to /admin/togglemark with the ID number of the task and then reloads the task lists with the updated check mark.
*	\return void
*/
function ToggleMark(ID){
	ToggleMarker = "/admin/togglemark?taskid=" + ID;
	$.get(ToggleMarker,function(data,status){
		ListTasks(function(){
			TodaysTasks(function(){});
		});
	});
}

/** \fn ToggleAdmin
*	\brief Marks a user as an admin or not an admin
*	\pre A user is clicked on
*	\param ID The id number of the user that was clicked
*	\details Sends a call to /admin/toggleadmin with the ID number of the user and then reloads the admin list with the updated information.
*	\return void
*/
function ToggleAdmin(ID){
	ToggleAdminMark = "/admin/toggleadmin?memberid=" + ID;
	$.get(ToggleAdminMark,function(Data,Status){
		DisplayAdmin(function(){});
	});
}

/** \fn ToggleExclude
*	\brief Marks a user to be excluded or not from all drop down menus
*	\pre A user is checked or x'd
*	\param ID The id number of the user that was checked or x'd
*	\details Sends a call to /admin/toggleexclude with the ID number of the user and then reloads the admin list with the updated information.
*	\return void
*/
function ToggleExclude(ID){
	ToggleExcluder = "/admin/toggleexclude?memberid=" + ID;
	$.get(ToggleExcluder,function(data,status){
		DisplayAdmin(function(){});
	});
}


