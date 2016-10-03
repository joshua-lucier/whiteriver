/*******************************************************************************************************//**
*	\file scripts.js
*	\brief Scripts applied to whole site
*	\details Contains scripts that are applied to the entire site.  This includes ajax settings and 
* 	\details uniform field dsettings.
*   \author Joshua Lucier
*	\version 0.1
*	\date October 3, 2016
*	\pre Must have working API
*	\copyright MIT License
***********************************************************************************************************/

/** \fn ajaxsetup
*	\brief Settings for ajax
*	\param settings object
*	\details Cache is set to false so that IE does not store ajax output.
*	\return void
*/
$.ajaxSetup({ cache: false });

/** \fn ready
*	\brief Marks empty fields in forms
*	\param function 
*	\details Marks each empty form field as empty.  When the user clicks into the field the empty line disappears.
*	\details When the user clicks out of the field, the field is marked empty again if there is nothing in it.
*	\return void
*/
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
