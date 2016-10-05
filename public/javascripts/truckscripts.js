/*******************************************************************************************************//**
*	\file truckscripts.js
*	\brief Scripts applied to mobile app
*	\details These scripts are applied to the mobile trucks page.  It is mostly AJAX calls.
*   \author Joshua Lucier
*	\version 0.1
*	\date October 5, 2016
*	\pre Must have working API
*	\copyright MIT License
***********************************************************************************************************/

/** \fn GetTidyRuns
*	\brief Gets runs that need to be reported on and displays them
*	\pre The page is loaded
*	\param TruckID Id of the truck that the user is in
*	\param callback A function
*	\details Cache is set to false so that IE does not store ajax output.
*	\return void
*/
function GetTidyRuns(TruckID,Callback){
	$.get("/truck/gettidyruns?truckid="+TruckID, function(Data,Status){
		$("#TidyRuns").html(Data);
		Callback();
	});
}


/** \fn GetStatus
*	\brief Gets the truck status and displays it
*	\param TruckID The ID of the truck the user is in
*	\param Callback A function
*	\details This function gets the code for the status menu along with the status.
*	\details It then displays the html in the #truckstatus div.
*	\return void
*/
function GetStatus(TruckID,Callback){
	$.get("/truck/getstatus?truckid="+TruckID, function(Data,Status){
		$("#truckstatus").html(Data);
		GetTidyRuns(TruckID,function(){
			Callback();
		});
	});
}

/** \fn Responding
*	\brief Called when the user presses responding.
*	\pre The user presses responding.
*	\param TruckID The ID of the current truck
*	\param Callback A function
*	\details The status is changed to responding and then GetStatus is called
*	\return void
*/
function Responding(TruckID, Callback){
	$.sget("/truck/responding?truckid="+TruckID, function(Data,Status){
		$("#Message").html(Data);
		GetStatus(TruckID, function(){
			Callback();
		});
	});
}

/** \fn OnScene
*	\brief Changes status to onscene
*	\pre The user clicks on onscene
*	\param TruckID Truck ID of the current truck
*	\details Changes the status of the current truck to onscene and calls Getstatus
*	\details to refresh the status display.
*	\return void
*/
function OnScene(TruckID, Callback){
	$.get("/truck/onscene?truckid="+TruckID, function(Data,Status){
		$("#Message").html(Data);
		GetStatus(TruckID, function(){
			Callback();
		});
	})
}

//Marks status as transporting
function transporting(truckid, callback){
	$.get("/truck/transporting?truckid="+truckid, function(data,status){
		$("#Message").html(data);
		getstatus(truckid, function(){
			callback();
		});
	})
}

//Marks status as arrived
function arrived(truckid, callback){
	$.get("/truck/arrived?truckid="+truckid, function(data,status){
		$("#Message").html(data);
		getstatus(truckid, function(){
			callback();
		});
	})
}

//Marks run as finished
function clearrun(truckid, callback){	
	$.get("/truck/clear?truckid="+truckid, function(data,status){
		$("#Message").html(data);
		getstatus(truckid, function(){
			callback();
		});
	})
}

//Marks status as in service
function service(truckid, callback){
	$.get("/truck/service?truckid="+truckid, function(data,status){
		$("#Message").html(data);
		getstatus(truckid, function(){
			callback();
		});
	})
}