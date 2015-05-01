Engine = (function(){
	'use strict';

	function cantSeeMe() {

	}


	function doesStuff() {
		cantSeeMe();
		return 1;
	}

	return {
		doesStuff: doesStuff
	};
}());
