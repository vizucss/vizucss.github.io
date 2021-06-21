
raiz.interpolation.filter('toHtmlEntities',function(content,snippetParameters,callback){    	
	
	if(document.querySelector(snippetParameters)){
		var content = document.querySelector(snippetParameters).innerHTML;
		document.querySelector(snippetParameters).classList.add('hide');	
		// console.log(snippetParameters);	
	}


	content = content.replace(/\<tbody\>/g, '');
	content = content.replace(/\<\/tbody\>/g, '');


	var repl = '<span taghigh="$1">&lt;$1&gt;</span>';
	
	content = content.replace(/<([^>]*)>/gmi, function(match, contents, offset, input_string){				
			var tag = contents.split(' ')[0];
	        return '<span taghigh="'+tag+'">&lt;'+contents+'&gt;</span>';
	    }
	);

	content = content.replace(/\t/g, '<span tag="tab"></span>');
	content = content.replace(/\n/g, '<span tag="newline"></span>');

	callback(content);
});	