"use strict";

var gulp = require("gulp"),
	concat = require("gulp-concat"),
	postcss = require("gulp-postcss"),
	uglify = require("gulp-uglify-es").default,
	sass = require("gulp-sass"),
	maps = require("gulp-sourcemaps"),
	del = require("del"),
	autoprefixer = require("autoprefixer"),
	browserSync = require("browser-sync").create(),
	cssmin = require("gulp-cssmin"),
	injectPartials = require("gulp-file-include");

gulp.task("compileSass", function() {
	return (
		gulp
			.src("src/assets/sass/main.scss")
			.pipe(maps.init())
			.pipe(sass().on("error", sass.logError))
			.pipe(postcss([autoprefixer()]))
			.pipe(maps.write("./"))
			.pipe(gulp.dest("dist/assets/css"))
			.pipe(browserSync.stream())
	);
});

gulp.task("compileHtml", function() {
	return gulp
		.src(["src/views/**/*.html", "!src/views/partial/**/*.html"])
		.pipe(
			injectPartials({
				prefix: "@@",
				basepath: "@file"
			})
		)
		.pipe(gulp.dest("dist/"))
		.pipe(browserSync.stream());
});

gulp.task("watchFiles", function() {
	gulp.watch("src/views/**/*.html", gulp.series("compileHtml"));
	gulp.watch("src/assets/sass/**/*.scss", gulp.series("compileSass"));
});

gulp.task("clean", function() {
	return del(["dist/**/*", "!dist/assets/**", "!dist/favicon.ico", "dist/assets/css/main.css"]);
});

gulp.task(
	"build",
	gulp.parallel("clean", "compileSass", "compileHtml", function() {
		return gulp
			.src(["src/assets/css/**", "src/assets/js/**", "src/assets/img/**", "src/assets/fonts/**"], { base: "./" })
			.pipe(gulp.dest("dist"));
	})
);

gulp.task(
	"serve",
	gulp.parallel("build", "watchFiles", function() {
		browserSync.init({
			server: "./dist"
		});

		gulp.watch("src/assets/sass/**/*.scss", gulp.series("watchFiles"));
		gulp.watch(["src/views/*.html"]).on("change", browserSync.reload);
	})
);

gulp.task("default", gulp.parallel("build"));
