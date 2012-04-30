(function($){

	$(document).ready(function(){
		
		//Ease.BitFeed found in plugins.js
		var feed = 	new Ease.BitFeed({
						url: 'http://pipes.yahoo.com/pipes/pipe.run',
						id:  'f42c711ab0e64056fd200b38ad98e102',
						contSelector: '#feed'
					});
	});

})(jQuery);