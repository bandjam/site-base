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

    // Paths to ssh config & private key
    /*
    testServer.json
    {
        "host": "web02",
        "username": "trevor"
    }
    */
    var sshConfigFile = '.ssh/testServer.json';
    var sshKeyFile = '.ssh/test-server-key';
    var serveStatic = require('serve-static');

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        // Project settings
        yeoman: appConfig,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
          bower: {
            files: ['bower.json'],
            tasks: ['wiredep', 'copy:svg']
          },
          js: {
            files: ['<%= yeoman.app %>/**/*.js', '!<%= yeoman.app %>/**/*_test.js'],
            tasks: ['karma:continuous:run'],
            options: {
              livereload: true
            }
          },
          jsTest: {
            files: ['<%= yeoman.app %>/**/*_test.js'],
            tasks: ['karma:continuous:run']
          },
          svg: {
            files: ['<%= yeoman.app %>/images/**/*.svg', '!<%= yeoman.app %>/images/sprite/**'],
            tasks: ['svg_sprite:dist']
          },
          gruntfile: {
            files: ['Gruntfile.js']
          },
          livereload: {
            files: [
              '<%= yeoman.app %>/**/*.html',
              '<%= yeoman.app %>/**/*.css',
              '<%= yeoman.app %>/styles/{,*/}*.css',
              '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
            ]
          },
          options: {
            livereload: true
          }
        },

        // The actual grunt server settings
        connect: {
          options: {
            port: 9000,
            // Change this to '0.0.0.0' to access the server from outside.
            hostname: 'localhost',
            livereload: true
          },
          livereload: {
            options: {
              open: true,
              middleware: function (connect) {
                return [
                  require('connect-livereload')(),
                  serveStatic('.tmp'),
                  connect().use('/bower_components', serveStatic('./bower_components')),
                  serveStatic(appConfig.app)
                ];
              }
            }
          },
          coverage: {
            options: {
              open: true,
              port: 9003,
              keepalive: true,
              base: './coverage/'
            }
          },
          dist: {
            options: {
              port: 9002,
              open: true,
              base: '<%= yeoman.dist %>'
            }
          }
        },

        karma: {
            options: {
              configFile: './karma.conf.js'
            },
            unit: {
              singleRun: true,
              browsers: ['Chrome'],
              reporters: ['notify', 'coverage']
            },
            continuous: {
              singleRun: false,
              background: true,
              browsers: ['Chrome'],
              reporters: ['progress', 'notify']
            }
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
          },
          api: {
            options: { force: true },
            files: [{
                dot: true,
                src: ['<%= yeoman.api %>/{,*/}*']
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
                'bower_components/fancybox/source/*.{png,gif}',
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
              dot: true,
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
        },

        // SSH files used to clean and deploy using sftp on a test server.
        // Be sure to .gitignore the .ssh/ folder !
        // testServer should contain :
        // {
        //    "host": 'my-test-server.com',
        //    "username": 'my-username-on-this-server',
        //    "password": 'include-only-if-not-using-private-key-below'
        // }
        sshconfig: {
          testServer: grunt.file.exists(sshConfigFile) ? grunt.file.readJSON('.ssh/testServer.json') : null
        },
        // This is the private key for the username on the host defined in testServer.json
        testServerKey: grunt.file.exists(sshKeyFile) ? grunt.file.read('.ssh/test-server-key') : null,
        // Removes everything at the deploy location to avoid filling up the server with revved files.
        sshexec: {
          cleanTest: {
            command: 'rm -rf /var/www/html/ngcart/*',
            options: {
              config: 'testServer',
              privateKey: '<%= testServerKey %>'
            }
          },
          cleanTestApi: {
            command: 'cd /var/www/html/api; ls | egrep -v "tmp|uploads" | xargs rm -rf',
            options: {
              config: 'testServer',
              privateKey: '<%= testServerKey %>'
            }
          }
        },
        // Deploy with sftp to the test server
        sftp: {
          test: {
            files: {
              './': ['<%= yeoman.dist %>/**/*', '<%= yeoman.dist %>/.git*']
            },
            options: {
              path: '/var/www/html/ngcart',
              srcBasePath: "dist/",
              config: 'testServer',
              privateKey: '<%= testServerKey %>',
              showProgress: true,
              createDirectories: true
            }
          },
          testapi: {
            files: {
              './': ['api/**/*', 'api/.*']
            },
            options: {
              path: '<%= yeoman.api %>',
              srcBasePath: "api/",
              config: 'testServer',
              privateKey: '<%= testServerKey %>',
              showProgress: true,
              createDirectories: true
            }
          }
        }

    });

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
    grunt.registerTask('deploy', 'Build and deploy to test server', function () {
      return grunt.task.run([
        'build',
        'sshexec:cleanTest',
        'sftp:test'
      ]);
    });
    grunt.registerTask('deployapi', 'Build and deploy to test server', function () {
      return grunt.task.run([
        'sshexec:cleanTestApi',
        'sftp:testapi'
      ]);
    });
    grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
      if (target === 'dist') {
        return grunt.task.run(['build', 'connect:dist:keepalive']);
      }

      grunt.task.run([
          'wiredep',
          //'karma:continuous',
          'connect:livereload',
          'watch'
        ]);
    });
    grunt.registerTask('devmode', ['karma:unit', 'watch']);
    grunt.registerTask('testunit', ['karma:unit']);
    grunt.registerTask('test', ['karma:travis']);
    grunt.registerTask('default', ['test', 'build']);


};
