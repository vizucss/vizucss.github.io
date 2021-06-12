var base64 = require('./libs/base64.js');
var through = require('through2');
var request = require('request');
var fs = require('fs');




module.exports = function (options) {

	
	var listComponents = {};
	var listComponentsFounded = [];
	var urlBase = options.url ;
	var destFile = options.dest || null ;
	var formatOutput = options.format || 'javascript' ;
	var timeout = 3;

	function goTimeout(src,callback){
		if(timeout>5){
			if(callback)callback(src);
			return false;
		}
		timeout++;
		setTimeout(function(src,callback){
			goTimeout(src,callback);
		},100,src,callback);
	}


	function get(src,nivel,contentSettings,pathBack,callbackInit){

		timeout = 0;

		var re = /(<link\s+(?:[^>]*?\s+)?raiz-component=["|\']([^"]*)["|\']|<raiz-component\s+(?:[^>]*?\s+)?name=["|\']([^"]*)["|\']|raiz\.components\.load(\s+)?\((?:[^>]*?\s+)?name(\s+)?:(\s+)?["|\']([^"]*)["|\'](\s+|,))/g;

		var componentsFounded = [];

		while (m = re.exec(src)) {
			if(m[2] == undefined){
				if(m[3] === undefined){
			    	var componentValue = m[7];
				}else{				
			    	var componentValue = m[3];
				}
			}else{
				var componentValue = m[2];
			}

			if(componentValue == undefined) continue;

			if( listComponentsFounded.indexOf(componentValue) === -1 ){
				listComponentsFounded[listComponentsFounded.length] = componentValue;
			}else{
				continue;
			}

			if( componentValue.indexOf('::') === -1 ) continue;

			var componentValueArray = componentValue.split('::');
			var componentDir = componentValueArray[0];
			var componentName = componentValueArray[1];

			if(componentDir.indexOf('$')!== -1){
	  			componentDir = componentDir.replace('$','');
	  			componentDir = contentSettings.components.repositories[componentDir];

	  		}

			var componentNameArray = componentName.split('#');
	  		componentName = componentNameArray[0];
	  		var componentVersion = componentNameArray[1] || '';

	  		componentVersionPath = '';
	  		if(componentVersion!= '')
	  		componentVersionPath = '/version/'+componentVersion;

	  		var componentPath = urlBase+'/'+componentDir+'/'+componentName+componentVersionPath;

	  		if( componentDir === '{package-url}'){
	  			
	  			if( pathBack.substr( pathBack.length-1 ) !== '/' ) 
	  				pathBack = pathBack + '/';

	  			componentPath = pathBack+componentName+componentVersionPath;
	  		}

			var componentPathFull = componentPath +'/package.html';

			componentsFounded[componentsFounded.length] = {
				path: componentPathFull,
				name:componentName,
				version:componentVersion,
				target:componentValue,
			};

		}

	
		loadNow(componentsFounded,0,nivel,contentSettings);

		
	}

	function loadNow(array,index,nivel,contentSettings){

		if(array[index] === undefined){
			return;
		}
		
		var path = array[index].path;
		var componentName = array[index].name;
		var componentVersion = array[index].version;
		var componentValue = array[index].target;

		if(nivel === 0){
			console.log(index,path);	
		}else{	
			console.log(" ",path);				
		}

		request.get(path,function(error,response,body){

		  	if(response.statusCode === 404){
		  	}else{

		  		var bodySave = base64.encode(body);
		  			
		  			
		  		if(typeof contentSettings !== 'undefined')
			  	for(var key in contentSettings.components.repositories){
			  		var name = contentSettings.components.repositories[key];					  		
			  		var regexConvert = new RegExp('\\$'+key, 'ig');							
			  		bodySave = bodySave.replace(regexConvert,name);					  						  		
			  		componentValue = componentValue.replace(regexConvert,name);
			  	}

		  		listComponents[componentName] = {
		  			name: componentName,
		  			data: bodySave,
		  			target:componentValue,
		  			version:componentVersion
		  		};		


				var dir = path;
				dir = dir.replace('package.html','');
				
		  		get(body,nivel+1,contentSettings,dir);
		  	}
	    });




		setTimeout(function(array,index,nivel,contentSettings){
			loadNow(array,index+1,nivel,contentSettings);
		},100,array,index,nivel,contentSettings);
	}
  
  return through.obj(function (vinylFile, encoding, callback) {

    var transformedFile = vinylFile.clone();

    var src = String(transformedFile.contents);

  	goTimeout(src,function(src){

  		
  		if(formatOutput === 'json'){
  			var components = JSON.stringify(listComponents);
  		}else if(formatOutput === 'javascript'){
  			var jsonComponents = JSON.stringify(listComponents)
  			jsonComponents = jsonComponents.replace(/\</g,'&lt;');
  			var components = 'raiz.components.loadByJson(\''+jsonComponents+'\');';
  		}

  		var destDirArray = destFile.split('/');
  		delete destDirArray[destDirArray.length-1];
  		var destDir = destDirArray.join('/');

  		if(!fs.existsSync(destDir) ){
  			fs.mkdirSync(destDir)
  		}
  		
  		console.log("");
  		console.log(" Writing in: ");
  		console.log(destFile);
  		console.log("");

  		fs.writeFile(destFile, components,function(err, data){
  			
  		});
  	
  		 
  		if(formatOutput === 'json'){
  			
  		}else if(formatOutput === 'javascript'){
  			src = src.replace(/<!-- ?include-raiz-join-components ?-->/g,'<script type="text/javascript" >'+components+'</script>');
  		}
  		
  		transformedFile.contents = new Buffer(src);
	    callback(null, transformedFile);
  	});

    get(src,0);


  });
}