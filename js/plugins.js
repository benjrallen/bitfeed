/*
 * Try/Catch the console
 */
try{
    console.log('Hello Ease.');
} catch(e) {
    window.console = {};
    var cMethods = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(",");
    for (var i=0; i<cMethods.length; i++) {
        console[ cMethods[i] ] = function(){};
    }
}

/*
 * JavaScript Pretty Date
 * Copyright (c) 2011 John Resig (ejohn.org)
 * Licensed under the MIT and GPL licenses.
 */

// Takes an ISO time and returns a string representing how
// long ago the date represents.

//MODIFIED
function prettyDate(time){
	var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
		//diff = (((new Date()).getTime() - date.getTime()) / 1000 ),
		//MODIFIED TO ADD TIMEZONE OFFSET
		diff = (((new Date()).getTime() - date.getTime() + ((date.getTimezoneOffset() + 60) * 60 * 1000)) / 1000 ),
		day_diff = Math.floor(diff / 86400);
		
	if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
		return;

			
	return day_diff == 0 && (
			diff < 60 && "just now" ||
			diff < 120 && "1 minute ago" ||
			diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
			diff < 7200 && "1 hour ago" ||
			diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
		day_diff == 1 && "Yesterday" ||
		day_diff < 7 && day_diff + " days ago" ||
		day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
}


var Ease = Ease || {};

(function($){

	Ease.setDefaults = function(config){
		if( this.defaults )
			for ( var key in this.defaults )
				this[key] = config[key] || this.defaults[key];

		delete this.defaults;
	};

	Ease.MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	
	Ease.formatDate = function( time ){
		
		var time = time.split('-');
		var date = new Date( time[0], time[1], time[2] );
		
		date = ''+Ease.MONTHS[date.getMonth()]+' '+(date.getDay() + 1 )+', '+date.getFullYear();
		
		return date;

	};
	
	//make a new object 
	Ease.BitFeed = function( config ){
		this.defaults = {
			url: 	null,
			id: 	null,
			contSelector: null
		};
		Ease.setDefaults.apply( this, [config] );
		//need a content container
		
		//find the container
		this.$cont = $(this.contSelector);
		if( !this.$cont.length )
			return false;
		
		this.ajax = null;	//the ajax request
		this._feed_data = null;	//data for the feed		
		
		this.itemIndex = {};//keep track of the items and their indexes
		this.items = [];	//for the item instances	
		this.currentItem = null;
		
		return this.init();
	};
	
	Ease.BitFeed.prototype = {
		init: function(){			
			this.$header = $('#list-head');
			this.$footer = $('#list-foot');
			this.$listCont = $('#list-cont');
			this.$leafCont = $('#leaf-cont');
			this.$listInfo = $('#list-info');
			
			this.$leaf = this.makeLeaf().prependTo( this.$leafCont );
			
			this.fetchFeed();

			this.fixFlex();
			
		},
		
		fixFlex: function(){
			var that = this;
			//cache window object
			var $window = $(window),
				isFixed = false,
				contMargin = 20; //margin compensation
				
			//header scrolls with window
			$(window).scroll(function(e){
				var scroll = $window.scrollTop();
				
				if( scroll > 0 && !isFixed){
					isFixed = true; 
					
					that.$listInfo.css({
						position: 'fixed',
						left: that.$cont.position().left - contMargin
					});
				} else if( !isFixed ) {
					that.$listInfo.css({
						position: 'absolute',
						left: 0
					});
					
					isFixed = false;
				}
			}).resize(function(){
				
				if( isFixed ){
					that.$listInfo.css({
						left: that.$cont.position().left - contMargin
					});
					
					that.$leafCont.height( $(this).height() + 2 );	
				}
				
			});
		
			$window.trigger('resize').trigger('scroll');
			
		},
		//get the feed
		fetchFeed : function(){
			var that = this;
						
			this.ajax = $.ajax(
				this.url,
				{
					dataType: 'jsonp',
					data: {
						_id: this.id,
						_render: 'json'
					},
					jsonp: '_callback',
					success: function( data, status, xhr ){
						that.processFeed.apply( that, arguments );
					}
				}
			);
		},
		//the ajax callback
		processFeed: function( data, status, xhr ){			
			this.$listCont.html('');
			this.$list = null;
			$('#loading').hide();
			
			if( status === 'success' && data.value.items.length ){
				this._feed_data = data.value.items[0];
				this.makeListHeader();
				this.makeList();
				this.makeListFooter();
			}
		},
		makeListHeader: function(){
			this.$header.html('');
			
			var data = this._feed_data

			//make title
			var title = $('<h1 />', {
				html: '<span class="text">'+data.title.content+'<span>'
			}).appendTo( this.$header );
			//make icon
			if( data.icon )
				$('<div />', {
					html: '<img src="'+data.logo+'" alt="'+data.title.content+'" />'
				}).addClass('icon').prependTo( title );
			
			//make date
			if( data.updated ) {				
				$('<div />', {
					text: 'Updated ' + prettyDate( data.updated )
				}).addClass('date').appendTo( this.$header );
			}
			
		},
		makeListFooter: function(){
			this.$footer.html('');
			
			var data = this._feed_data;
			
			//copyright info
			if( data.rights && data.rights.content )
				$('<div />', {
					text: data.title.content + ' - ' + data.rights.content
				}).addClass('copy').appendTo( this.$footer );
			
			//feed info... nevermind, link doesn't work.
			// if( data.link )
			// 	$('<a />', {
			// 		href: 	data.link.href,
			// 		rel:  	data.link.rel,
			// 		type: 	data.link.type,
			// 		target: '_blank',
			// 		text: 	'Feed'
			// 	}).addClass('feed').appendTo( this.$footer );
		},
		makeList: function(){
			if( !this.$list )
				this.$list = $('<div />', {}).addClass('list-list').appendTo( this.$listCont );
			
			var that = this;
			
			//function to pull out id and pass it along to the function with all the actions
			var onItemClick = function(e){
				return that.onListClick( this.id );
			};
			
			$.each( this._feed_data.entry, function(i){
				var item = new Ease.BitFeed.Item( that, this );
				
				//put it in the list
				item.$item.click( onItemClick ).appendTo( that.$list );
								
				//push the item instance and track it's index number in that array
				that.itemIndex[this.id] = that.items.push( item ) - 1;

			});
			
		},
		onListClick: function( id ){
			this.currentItem = this.getItemById( id );
			
			this.updateLeaf();
		},
		onLeafBack: function(){
			this.currentItem = null;
			
			this.$leafCont.css({
				left: '-9999em'
			});
		},
		onLeafNext: function(){
			if( !this.currentItem )
				return false;
			
			//get current item index
			var index = this.getItemIndex( this.currentItem.data.id ) + 1;
			//check if there is a next one
			if( index >= this.items.length )
				index = 0;
			
			this.currentItem = this.getItemByIndex( index );

			return this.updateLeaf();
		},
		onLeafPrev: function(){
			if( !this.currentItem )
				return false;

			//get current item index
			var index = this.getItemIndex( this.currentItem.data.id ) - 1;
			//check if there is a prev one
			if( index < 0 )
				index = this.items.length - 1;
			
			this.currentItem = this.getItemByIndex( index );

			return this.updateLeaf();
		},
		getItemIndex: function( id ){
			return this.itemIndex[ id ];
		},
		//retrieve the instance of an item by it's id
		getItemByIndex: function( index ){
			return this.items[ index ];
		},
		getItemById: function( id ){
			return this.getItemByIndex( this.getItemIndex( id ) );
		},
		updateLeaf: function(){			
			this.$leaf.find('article').html( this.currentItem.buildLeafContent() );
			
			this.$leafCont.css({ left: 0 });
		},
		makeLeaf: function(){
			var that = this;
			
			var leaf = $('<div />', {
				id: 'leaf',
				html: '<div class="span8 wrap"><article></article></div>'
			}).addClass('container');
			
			//the back button
			var back = $('<button />', {
				id: 'leaf-back',
				text: 'Back to list'
			}).addClass('btn btn-leaf-back')
			.click(function(){
				that.onLeafBack.call(that);
			})
			.prependTo( leaf.find('.wrap') );
			
			//the nav
			var nav = $('<div />', {
				id: 'leaf-nav'
			}).prependTo( leaf.find('.wrap') );
			
			
			//next item
			$('<button />', {
				text: 'Previous'
			}).addClass('btn btn-prev')
			.click(function(){
				that.onLeafPrev.call(that);
			})
			.appendTo( nav );

			//next item
			$('<button />', {
				text: 'Next'
			}).addClass('btn btn-next')
			.click(function(){
				that.onLeafNext.call(that);
			})
			.appendTo( nav );
			
			return leaf;
		}
		
	};

	Ease.BitFeed.Item = function(feed, data){
		//objectify the item in the feed by calling it ugly
		this._feed = feed;
		//save the data
		this.data = data;
		
		//the jquery item info
		this.$item = null;
		//parse the full content of the feed item for the html and store it so it can be shortened
		this.$full_content = null;
		
		this.init();
		
		return this;
	};
	
	Ease.BitFeed.Item.prototype = {
		//fire it up
		init: function(){
			
			this.$item = $('<article />', {
				id: this.data.id
			}).addClass('list-item');

			//build out the full content so it can be parsed down
			this.$full_content = $('<div />', { 
				html: this.data.content.content
			}).addClass('content');

			this.buildListContent();
			
		},
		//build content for feed item
		buildListContent : function(){
			//make the header
			this.makeItemHeader().appendTo( this.$item );

			//the time.  true means pretty
			this.makeDate( true ).appendTo( this.$item )
			
			//the content
			$('<div />', {
				text: this.getShortContent( 140, true )
			}).addClass('content').appendTo( this.$item );
		},
		makeItemHeader: function(){
			var head = $('<header />', {
				html: '<span class="pic"><span class="line"></span></span><span class="text">'+this.data.title+'</span>'
			}).addClass('item-head');

			//the image urls aren't reliable...
			head.find('.pic').append( this.makeThumbnail() );

			return head;
		},
		//make the thumbnail and make sure it doesn't show as broken
		makeThumbnail: function(){
			var img = new Image(),
				that = this;
			
			img.onerror = function( evt ){
				this.src = that._feed._feed_data.icon;
			};
			img.src = this.data['media:thumbnail'].url;
			
			return img;
		},
		makeDate: function( pretty ){
			//the time... 
			var time = this.data.published;

			//try to make it pretty at first
			if( pretty ){
				time = prettyDate( this.data.published );
				time = time ? time : Ease.formatDate( this.data.published );
			} else {
				time = Ease.formatDate( time );
			}
			
			return $('<span />', {
				text: 'Added ' + time
			}).addClass('time');
		},
		makeItemFormat: function(){
			var list = $('<ul />');
			
			if( this.data.format ){
				var added = false;
				
				for( var key in this.data.format ){
					//dont put in unprovided information
					var value = this.data.format[key];
					if( value && key !== 'xmlns'){
						var item =  '<li>'+
										'<span class="label">'+key.replace('_', ' ').replace('_', ' ')+':</span>'+
										'<span class="value">'+value+'</span>'+
									'</li>';
						
						list.append( item );
						added = true;
					}
				}
				
				if( added )
					list.addClass('well item-format');
			}	
			
			return list;
		},
		makeAuthor: function(){
			return $('<span />', {
				text: (this.data.author && this.data.author.name ? this.data.author.name : '')
			}).addClass('author');
		},
		makeLinks: function(){
			var that = this,
				links = $('<div />', {}).addClass('links');

			$.each( this.data.link, function(){
				var text = 'link';
				switch( this.rel ){
					case 'alternate':
						text = 'More Information';
						break;
					case 'enclosure':
						text = 'Download Torrent';
						break;
					case 'license':
						text = that.data.rights;
						break;
				}
				
				$('<a />', {
					text: text,
					href: this.href,
					rel: this.rel,
					type: (this.type ? this.type : ''),
					target: '_blank'
				}).appendTo( links );
			});

			return links;
		},
		//make the full content
		buildLeafContent : function(){
			
			var block = $('<div />').addClass('leaf-content');
			
			this.makeItemHeader().appendTo( block );
			this.makeItemFormat().appendTo( block );
			this.makeAuthor().appendTo( block );
			this.makeDate().appendTo( block );
			this.makeLinks().appendTo( block );

			//the content
			this.$full_content.appendTo( block );

			return block;
			
		},
		//parse the full content of the feed item for the html and store it so it can be shortened
		// n = number of characters, fullWords = truncate to full words
		getShortContent : function( n, fullWords ){
			var text = this.$full_content.text(),
				over = text.length > n;
			
			text = over ? text.substr(0, n-1) : text;
			text = over && fullWords ? text.substr(0, text.lastIndexOf(' ')) : text;
			
			return over ? text+'...' : text;
		}

	}

})(jQuery);