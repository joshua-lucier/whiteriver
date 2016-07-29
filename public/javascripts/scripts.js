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

$('input[type="radio"] + span::before').html('<img src="/images/emptycheck.png');
$('input[type="radio"]:checked + span::before').html('<img src="/images/checked.png">');

$('input[type="radio"]').click(function(){
	$('input[type="radio"] + span::before').html('<img src="/images/emptycheck.png');
	if($($(this)).is(':checked')) {

	}
});