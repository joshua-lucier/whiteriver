function getstatus(truckid,callback){
	$.get("/truck/getstatus?truckid="+truckid, function(data,status){
		$("#truckstatus").html(data);
		callback();
	});
}

function responding(truckid, callback){
	$.get("/truck/responding?truckid="+truckid, function(data,status){
		$("#Message").html(data);
		getstatus(truckid, function(){});
		callback();
	});
}

function onscene(truckid, callback){
	$.get("/truck/onscene?truckid="+truckid, function(data,status){
		$("#Message").html(data);
		getstatus(truckid, function(){});
		callback();
	})
}

function transporting(truckid, callback){
	$.get("/truck/transporting?truckid="+truckid, function(data,status){
		$("#Message").html(data);
		getstatus(truckid, function(){});
		callback();
	})
}

function arrived(truckid, callback){
	$.get("/truck/arrived?truckid="+truckid, function(data,status){
		$("#Message").html(data);
		getstatus(truckid, function(){});
		callback();
	})
}

function clear(truckid, callback){
	$.get("/truck/clear?truckid="+truckid, function(data,status){
		$("#Message").html(data);
		getstatus(truckid, function(){});
		callback();
	})
}

function service(truckid, callback){
	$.get("/truck/service?truckid="+truckid, function(data,status){
		$("#Message").html(data);
		getstatus(truckid, function(){});
		callback();
	})
}