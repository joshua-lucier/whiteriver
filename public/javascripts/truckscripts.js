function getstatus(truckid,callback){
	console.log('status');
	$.get("/truck/getstatus?truckid="+id, function(data,status){
		$("#truckstatus").html(data);
		callback();
	});
}

