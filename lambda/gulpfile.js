const gulp = require("gulp");
const argv = require('yargs').argv;

const $$ = require("gulp-load-plugins")({
    lazy: true
});

gulp.task("test", function () {
    const cfg = {
        src: ["./src/**/*.js"],
        tests: ["./tests/**/*.js"]
    };
    var options = {};

    if (argv.grep) {
        options.grep = argv.grep;
    }

    return gulp.src(cfg.tests)
        .pipe($$.mocha(options));
});