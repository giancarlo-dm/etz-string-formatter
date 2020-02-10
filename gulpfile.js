"use strict";

const gulp = require("gulp");
const gulpTypescript = require("gulp-typescript");
const del = require("del");

const typescriptProject = gulpTypescript.createProject("tsconfig.json", {
	removeComments: true
});
const typescriptDeclarationProject = gulpTypescript.createProject("tsconfig.json", {
	declaration: true,
	noResolve: false,
	emitDeclarationOnly: true,
	removeComments: false
});

function clean() {

	return del(["dist"]);
}

function build() {

	return gulp.src(["src/**/*.ts", "!src/**/*.spec.ts"])
		.pipe(typescriptProject())
		.on("error", function(err) {
			console.error(err);
			process.exit(1);
		})
		.pipe(gulp.dest("dist"));
}

function buildDeclaration() {

	return gulp.src(["src/**/*.ts", "!src/**/*.spec.ts"])
		.pipe(typescriptDeclarationProject())
		.on("error", function(err) {
			console.error(err);
			process.exit(1);
		})
		.pipe(gulp.dest("dist"));
}

const buildTask = gulp.series(clean, build, buildDeclaration);

exports.default = buildTask;
