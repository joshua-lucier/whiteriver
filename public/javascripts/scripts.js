$.ajaxSetup({ cache: false });

$("body").ready(function(){
	$(".input").each(function(index){
		if(!$(this).val()){
			$(this).after('<span class="message">Empty Field!!</span>');
		}
	});
	$(".input").blur(function(index){
		if(!$(this).val()){
			$(this).after('<span class="message">Empty Field!!</span>');
		}
	});

	$(".input").focus(function(index){
			console.log($(this));
			$(this).next().remove();
	}); 
});
