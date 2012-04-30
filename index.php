<!DOCTYPE html>
<!--[if lt IE 7 ]><html lang="" class="no-js ie ie6 lte7 lte8 lte9"><![endif]-->
<!--[if IE 7 ]><html lang="" class="no-js ie ie7 lte7 lte8 lte9"><![endif]-->
<!--[if IE 8 ]><html lang="" class="no-js ie ie8 lte8 lte9"><![endif]-->
<!--[if IE 9 ]><html lang="" class="no-js ie ie9 lte9"><![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--><html lang="" class="newbie no-js"><!--<![endif]-->
<head>
  <meta charset="utf-8">
  
  
  <script type="text/javascript" src="js/modernizr.js"></script>
  <script type="text/javascript">
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-31294605-1']);
    _gaq.push(['_trackPageview']);

    Modernizr.load([
      { load: ['//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js'],
    	  complete: function(){ if(!window.jQuery){ Modernizr.load('js/jquery.js'); } }
    	},
    	{ test: window.JSON, nope: 'js/json2.js' },
    	<?php /* plugins.js & common.js fordevelopment */ ?>
    	<?php /* ?>
    	{ load: 'js/plugins.js' },
    	{ load: 'js/common.js' },
    	<?php */ ?>
    	<?php /* concatenate and optimize seperate script files for deployment using google closure compiler (compiler.jar) in js folder */ ?>
    	{ load : 'js/theme.js' },
    	{ load: ('https:' == location.protocol ? '//ssl' : '//www') + '.google-analytics.com/ga.js' }
    ]);
  </script>
	  	<link rel="stylesheet" href="css/style.css" />

		<title>Bitfeed</title>
		<meta name="description" content="" />
	  <meta name="keywords" content="" />
		<meta name="robots" content="" />
</head>

<body>
  <div id="leaf-cont"></div>
  <div class="container">
    <section id="feed" class="row">
      <article id="list-info" class="span4">
        <header id="list-head"></header>
        <footer id="list-foot"></footer>
      </article>
      <div id="list-cont" class="span8 offset4">
      </div>
    </section>
  </div>
  <div id="loading">
    <div class="line"></div>
    <div class="text">Loading Feed...</div>
  </div>
</body>
</html>