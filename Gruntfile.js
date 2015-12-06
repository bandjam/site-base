// grunt build
// grunt karma:unit:start watch
// grunt karma:once


module.exports = function (grunt) {

    // Lazy-load grunt tasks automatically
    require('jit-grunt')(grunt, {
        useminPrepare: 'grunt-usemin',
        sshexec: 'grunt-ssh',
        sftp: 'grunt-ssh'
    });

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths for the application
    var appConfig = {
        app: require('./bower.json').appPath || 'app',
        dist: 'dist',
        webroot: '/var/www/html/ngcart',
        api: '/var/www/html/api'
    };

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        // Project settings
        yeoman: appConfig,

        karma: {
            unit: {
                configFile: 'karma.conf.js',
                background: true
            },
            once: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
            //,travis: {
            //    configFile: 'karma.conf.js',
            //    singleRun: true,
            //    browsers: ['PhantomJS']
            //}
        },

        watch: {
            karma: {
                files: ['src/**/*.js'],
                tasks: ['karma:unit:run']
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
          html: '<%= yeoman.app %>/index.html',
          options: {
            dest: '<%= yeoman.dist %>',
            flow: {
              html: {
                steps: {
                  js: ['concat', 'uglify'],
                  css: ['cssmin']
                },
                post: {}
              }
            }
          }
        },

        // Performs rewrites based on filerev and the useminPrepare configuration
        usemin: {
          html: ['<%= yeoman.dist %>/**/*.html'],
          css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
          js: ['<%= yeoman.dist %>/scripts/*.js'],
          options: {
            assetsDirs: ['<%= yeoman.dist %>','<%= yeoman.dist %>/images', '<%= yeoman.dist %>/styles'],
            patterns: {
              js: [
                [/(images\/albumdefault_50\.jpg)/, 'Replace javascript references to the album default image'],
                [/(images\/albumdefault_60\.jpg)/, 'Replace javascript references to the album default image'],
                [/(images\/albumdefault_160\.jpg)/, 'Replace javascript references to the album default image'],
                [/(styles\/Dark\.css)/, 'Replace javascript references to the theme CSS']
              ]
            }
          }
        },

        // Renames files for browser caching purposes
        filerev: {
          dist: {
            src: [
              '<%= yeoman.dist %>/scripts/{,*/}*.js',
              '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
              '<%= yeoman.dist %>/styles/{,*/}*.css',
              '<%= yeoman.dist %>/styles/*.{png,jpg,jpeg,gif,webp,svg}', // images user by vendor plugins
              '<%= yeoman.dist %>/styles/fonts/*'
            ]
          }
        },

        imagemin: {
          dist: {
            files: [{
              expand: true,
              cwd: '<%= yeoman.app %>/images',
              src: '{,*/}*.{png,jpg,jpeg,gif}',
              dest: '<%= yeoman.dist %>/images'
            },
            {
              expand: true,
              cwd: '.tmp/styles',
              src: '*.{png,jpg,jpeg,gif}',
              dest: '<%= yeoman.dist %>/styles'
            }]
          }
        },

        // Minify our CSS files but do not merge them, we still want to have two
        cssmin: {
          styles: {
            files: [{
              expand: true,
              cwd: '.tmp/styles',
              src: ['*.css', '!*.min.css'],
              dest: '<%= yeoman.dist %>/styles'
            }]
          }
        },

        htmlmin: {
          dist: {
            options: {
              collapseWhitespace: true,
              conservativeCollapse: true,
              collapseBooleanAttributes: true,
              removeCommentsFromCDATA: true,
              removeOptionalTags: true
            },
            files: [{
              expand: true,
              cwd: '<%= yeoman.dist %>',
              src: ['{,*/}*.html'],
              dest: '<%= yeoman.dist %>'
            }]
          }
        },

        // Automatically inject Bower components into the app
        wiredep: {
          app: {
            src: ['<%= yeoman.app %>/index.html'],
            ignorePath: /\.\.\//
          },
          test: {
            src: 'karma.conf.js',
            fileTypes: {
              js: {
                block: /(([\s\t]*)\/\/\s*bower:*(\S*))(\n|\r|.)*?(\/\/\s*endbower)/gi,
                detect: {
                    js: /'(.*\.js)'/gi
                },
                replace: {
                    js: '\'{{filePath}}\','
                }
              }
            },
            devDependencies: true
          }
        },

        // Empties folders to start fresh
        clean: {
          dist: {
            files: [{
              dot: true,
              src: [
                '.tmp',
                '<%= yeoman.dist %>/{,*/}*',
                '!<%= yeoman.dist %>/.git*'
              ]
            }]
          },
          coverage: {
            files: [{
                dot: true,
                src: ['./coverage']
            }]
          },
          www: {
            options: { force: true },
            files: [{
                dot: true,
                src: ['<%= yeoman.webroot %>/{,*/}*']
            }]
          }
        },

        // Copies remaining files to places other tasks can use
        copy: {
          dist: {
            files: [{
              expand: true,
              dot: true,
              cwd: '<%= yeoman.app %>',
              src: [
              '*.{ico,png,txt}',
              '.htaccess',
              '**/*.html',
              '**/*.json',
              'fonts/*.*'
              ],
              dest: '<%= yeoman.dist %>'
            },
            {
              expand: true,
              cwd: '<%= yeoman.app %>',
              src: ['images/sprite/*.svg'],
              dest: '<%= yeoman.dist %>'
            },
            {
              expand: true,
              
              src: ['styles/{,*/}*.css'],
              dest: '.tmp'
            },
            // Special copy for all the files expected by the plugins
            {
              expand: true,
              flatten: true,
              src: [
                'bower_components/jplayer/skin/pink.flag/*.{jpg,gif,png}',
                'bower_components/fancybox/source/*.{png,gif}'
              ],
              dest: '.tmp/styles'
            }
            ]
          },
          svg: {
            files: [{
              src: ['bower_components/open-iconic/sprite/sprite.svg'],
              dest: '<%= yeoman.app %>/images/sprite/iconic.svg'
            }]
          },
          www: {
              options: { force: true },
              expand: true,
              cwd: '<%= yeoman.dist %>',
              dest: '<%= yeoman.webroot %>',
              src: ['**']
          },
          api: {
              options: { force: true },
              expand: true,
              cwd: 'api',
              dest: '<%= yeoman.api %>',
              src: ['**']
          }
        },

        // bump versions in json files
        bump: {
          options: {
            files: ['package.json', 'bower.json', 'manifest.json'],
            commit: false,
            createTag: false,
            push: false
          }
        }

    });


    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('build', [
        'clean:dist',
        'wiredep:app',
        'copy:svg',
        'useminPrepare',
        'concat:generated',
        'copy:dist',
        'imagemin',
        //'ngAnnotate',
        'cssmin',
        'uglify:generated',
        'filerev',
        'usemin',
        'htmlmin'
    ]);
    grunt.registerTask('deploy', [
        'build',
        'copy:www'
    ]);
    grunt.registerTask('deployapi', [
        'build',
        'copy:api'
    ]);
    grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
      if (target === 'dist') {
        return grunt.task.run(['build', 'connect:dist:keepalive']);
      }

      grunt.task.run([
          'wiredep',
          'karma:continuous',
          'connect:livereload',
          'watch'
        ]);
    });
    grunt.registerTask('devmode', ['karma:unit', 'watch']);
    grunt.registerTask('testunit', ['karma:unit']);
    //grunt.registerTask('test', ['karma:travis']);


    grunt.registerTask('default', ['test', 'build']);


};
