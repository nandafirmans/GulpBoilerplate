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
			.src("assets/sass/main.scss")
			.pipe(maps.init())
			.pipe(sass().on("error", sass.logError))
			.pipe(postcss([autoprefixer()]))
			.pipe(maps.write("./"))
			.pipe(gulp.dest("public/assets/css"))
			.pipe(browserSync.stream())
	);
});

gulp.task("compileHtml", function() {
	return gulp
		.src(["views/**/*.html", "!views/partial/**/*.html"])
		.pipe(
			injectPartials({
				prefix: "@@",
				basepath: "@file"
			})
		)
		.pipe(gulp.dest("public/"))
		.pipe(browserSync.stream());
});

gulp.task("watchFiles", function() {
	gulp.watch("views/**/*.html", gulp.series("compileHtml"));
	gulp.watch("assets/sass/**/*.scss", gulp.series("compileSass"));
});

gulp.task("clean", function() {
	return del(["public/**/*", "!public/assets/**", "!public/favicon.ico", "public/assets/css/main.css"]);
});

gulp.task(
	"build",
	gulp.parallel("clean", "compileSass", "compileHtml", function() {
		return gulp
			.src(["assets/css/**", "assets/js/**", "assets/img/**", "assets/fonts/**"], { base: "./" })
			.pipe(gulp.dest("public"));
	})
);

gulp.task(
	"serve",
	gulp.parallel("build", "watchFiles", function() {
		browserSync.init({
			server: "./public"
		});

		gulp.watch("assets/sass/**/*.scss", gulp.series("watchFiles"));
		gulp.watch(["views/*.html"]).on("change", browserSync.reload);
	})
);

gulp.task("default", gulp.parallel("build"));
