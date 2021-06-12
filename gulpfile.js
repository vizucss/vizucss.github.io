var gulp = require('gulp');
var raizjoin = require('./gulp_modules/raizjoin');
var rename = require('gulp-rename');
var replace = require('gulp-replace');

gulp.task('default', async function (){

    return gulp.src("index.html")

    	/*.pipe(replace(
        	'<link rel="stylesheet" type="text/css" href="../assets/css/base.css">', 
        	''
        	))
        .pipe(replace(
        	'<!-- publish::vizu.min.css -->', 
        	'<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/vizucss/core@master/vizu.min.css">'))
*/
        .pipe(raizjoin({
        	url:'http://localhost/vizu/vizu.github.io/',
        	dest:'./app/dest/components.js',
        	format:'javascript'
        }))    

        .pipe(gulp.dest('./app/dest/'))
            
        ;

});
