function getstatus(truckid,callback){
	$.get("/truck/getstatus?truckid="+truckid, function(data,status){
		$("#truckstatus").html(data);
		callback();
	});
}

function responding(truckid, callback){
	$.get("/truck/responding?truckid="+truckid, function(data,status){
		console.log(data);
		getstatus(truckid, function(){});
		callback();
	});
}

function onscene(truckid, callback){
	$.get("/truck/onscene?truckid="+truckid, function(data,status){
		console.log(data);
		getstatus(truckid, function(){});
		callback();
	})
}

