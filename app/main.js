var main = (function(){
	var self = this;



	self.construct = function(){

		

	}

	self['[select-theme]'] = function(){
		return {
			click:function(){
				var value = this.getAttribute('select-theme');

				document.body.classList.remove('--default');
				document.body.classList.remove('--dark');

				if(value !== 'empty')
				document.body.classList.add('--'+value);
			}
		}
	}

	return this;
})();	