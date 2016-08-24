/*Trucks page scripts
By Joshua Lucier
MIT Licensed
*/

//Gets all runs that need to be tidied and displays them
function gettidyruns(truckid,callback){
	$.get("/truck/gettidyruns?truckid="+truckid, function(data,status){
		$("#TidyRuns").html(data);
		callback();
	});
}


//Gets the actual status of the truck
function getstatus(truckid,callback){
	$.get("/truck/getstatus?truckid="+truckid, function(data,status){
		$("#truckstatus").html(data);
		gettidyruns(truckid,function(){
			callback();
		});
	});
}

//Called when user presses responding.  Marks status as responding and opens a new run.
function responding(truckid, callback){
	$.get("/truck/responding?truckid="+truckid, function(data,status){
		$("#Message").html(data);
		getstatus(truckid, function(){
			callback();
		});
	});
}

//Marks status as onscene
function onscene(truckid, callback){
	$.get("/truck/onscene?truckid="+truckid, function(data,status){
		$("#Message").html(data);
		getstatus(truckid, function(){
			callback();
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