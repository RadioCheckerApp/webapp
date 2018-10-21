let gulp = require('gulp'),
    webserver = require('gulp-webserver'),
    del = require('del'),
    ftp = require('vinyl-ftp'),
    gutil = require('gulp-util'),
    minimist = require('minimist'),
    gulpNgConfig = require('gulp-ng-config'),
    addStream = require('add-stream'),
    concat = require('gulp-concat');

const args = minimist(process.argv.slice(2));

const buildFiles = [
    'index.html',
    './radiochecker/**',
    './assets/**'
];

const buildDir = './dist';

gulp.task('clean', function () {
    return del([buildDir]);
});

gulp.task('copy-sources', function () {
    return gulp.src(buildFiles, { base: '.', buffer: false })
        .pipe(gulp.dest(buildDir))
});

gulp.task('watch', function() {
    return gulp.watch(buildFiles, ['build-dev']);
});

gulp.task('dist-dev', gulp.series('copy-sources', function() {
    return gulp.src('./radiochecker/app.js')
        .pipe(addStream.obj(makeConfig('development')))
        .pipe(concat('app.js'))
        .pipe(gulp.dest(buildDir + '/radiochecker/'));
}));

gulp.task('build-dev', gulp.series('clean', 'dist-dev'));

gulp.task('dist-prod', gulp.series('copy-sources', function() {
    return gulp.src('./radiochecker/app.js')
        .pipe(addStream.obj(makeConfig('production')))
        .pipe(concat('app.js'))
        .pipe(gulp.dest(buildDir + '/radiochecker/'));
}));

gulp.task('build-prod', gulp.series('clean', 'dist-prod'));

function makeConfig(env) {
    return gulp.src('./app-config.json')
        .pipe(gulpNgConfig('appConfig', {
            environment: env
        }));
}

gulp.task('webserver', gulp.series('watch', function() {
    gulp.src('./dist')
        .pipe(webserver({
            livereload: true,
            directoryListing: false,
            open: "http://localhost:8000/index.html"
        }));
}));


gulp.task('deploy-dev', gulp.series('build-dev', function() {
    const remotePath = '/dev/';
    let conn = createFTPConnection('ftp68.world4you.com');
    // TODO: Remove unused files before uploading
    return gulp.src(buildDir + '/**', { base: './dist', buffer: false })
        .pipe(conn.newer(remotePath))
        .pipe(conn.dest(remotePath));
}));

gulp.task('deploy-prod', gulp.series('build-prod', function() {
    const remotePath = '/';
    let conn = createFTPConnection('ftp68.world4you.com');
    // TODO: Remove unused files before uploading
    return gulp.src(buildDir + '/**', { base: './dist', buffer: false })
        .pipe(conn.newer(remotePath))
        .pipe(conn.dest(remotePath));
}));

function createFTPConnection(host) {
    return ftp.create({
        host: host,
        user: args.user,
        password: args.password,
        log: gutil.log
    });
}