1.  Case Standard
	Constructor function or class, use camelCase.
	Regular Variable, function or instance use PascalCase
	Use PascalCase for global variables
	Use all lowercase for filenames, html id's, html classes and url's
	The purpose of this case standard is to not conflict with javascript library names.

2.  All comments are to use the java standard doxygen format
	a.  File Heading
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
	b.  Function Heading
/** \fn LoadPage
*	\pre The script is called
*	\brief Calls admin functions to display lists
*	\param callback A function that is passed to LoadPage
*	\details This function calls ListTasks, TodaysTasks, ListTrucks, ListAlerts, TodaysAlerts, and DisplayAdmin.  
*	\details It is designed to be called when the admin page first loads.
*	\return void
*/
	c. Detailed Variable Heading

/**
*	\var ImAPain
*	\details These are the details of this variable
*/
var ImAPain /** These are some more details */
	d.  Brief Variable heading

var Hello ///< Hello This is a description of this variable


