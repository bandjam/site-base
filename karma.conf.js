module.exports = function (config) {
    config.set({

        basepath: './',

        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'src/**/*.js'
        ],

        autowatch: false,

        frameworks: ['jasmine'],

        browsers: ['chrome'],

        plugins: [
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-phantomjs-launcher',
            'karma-jasmine'
        ],

        junitreporter: {
            outputfile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
