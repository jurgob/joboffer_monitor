phantom.casperPath = 'node_modules/casperjs/';
phantom.injectJs(phantom.casperPath + '/bin/bootstrap.js');

var fs = require('fs');
var casper = new require('casper').create(
{   
    pageSettings: {
        loadImages:  false,        // The WebPage instance used by Casper will
        loadPlugins: false         // use these settings
    },
    clientScripts: ["libs/jquery.min.js"]
});



var sources = {
	'falcon': "http://www.falconsocial.com/jobs/",
	'podio': "https://company.podio.com/jobs#intro",
	'maguru' : 'http://maguru.dk/jobs/',
    'momondo' : "http://www.momondo.com/content/jobs/"
}
var exclueParts =  {
	'maguru' : function(){
		$('footer').remove();
		$('.col-md-4').remove();
		$('.topbar').remove();
		$('.callbar').remove();
	},
    'falcon' : function(){
        $('header').remove();
        $('.social-c').remove();
    },
    'momondo': function(){
        $('#mui-header').remove();
    },
}

var sourcesNames = Object.keys(sources);
var curSourceIndex = 0;

casper.start().repeat(sourcesNames.length ,function() {
    var sourceName = sourcesNames[curSourceIndex];
    var contentFileName = "data/"+sourceName+".txt";
    var sourceUrl = sources[sourceName];
    var pageContentOld =  null;
    
    try{
    	pageContentOld = fs.read(contentFileName).trim();  	
    }catch(e){
    	pageContentOld =  '';
    }

    casper.thenOpen(sourceUrl, function(){
    	var excluePartsFunc = exclueParts[sourceName];
    	if(excluePartsFunc)
    		this.evaluate(excluePartsFunc);
    	var pageContent = this.evaluate(getPageContent);
        console.log('url: '+sourceUrl)
    	console.log('== '+sourceName + " content changed: "+ (pageContent != pageContentOld));
    	//TODO: write only when different
    	fs.write(contentFileName,pageContent , 'w');
    	fs.write('old'+contentFileName,pageContentOld , 'w');
    })

    curSourceIndex ++;
});//end start

casper.run();

function getPageContent(){
	//Array.prototype.forEach.call(document.querySelectorAll('script'), function(el){ el.remove()  } )
	//return document.body.innerHTML.trim();
	//$('body').remove('script');
	$('style').remove();
    $('script').remove();
	return $('body').text().trim();
}