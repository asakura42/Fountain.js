// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');

// Compile Our Sass
gulp.task('sass', function() {
    return gulp.src('assets/scss/*.scss')
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .on('error', function(err) {
            console.error(err.message);
            this.emit('end');
        })
        .pipe(gulp.dest('assets/css'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('assets/scss/*.scss', ['sass']);
    gulp.watch('assets/scss/*/*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['sass', 'watch']);