var gulp = require('gulp');
var raizjoin = require('./gulp_modules/raizjoin');

gulp.task('default', async function (){

    return gulp.src("index.html")
        .pipe(raizjoin({
        	url:'http://localhost/vizu/vizu.github.io/',
        	dest:'./app/dest/components.js',
        	format:'javascript'
        }));

});
