/*!
 * Bootstrap's Gruntfile
 * http://getbootstrap.com
 * Copyright 2013-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

module.exports = function(grunt) {
    'use strict';

    // Force use of Unix newlines
    grunt.util.linefeed = '\n';

    RegExp.quote = function (string) {
      return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    var fs = require('fs');
    var path = require('path');
    var configBridge = grunt.file.readJSON('../../bower_components/bootstrap/grunt/configBridge.json', { encoding: 'utf8' });


    // Project configuration.
    grunt.initConfig({

        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
                ' * Bootstrap v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
                ' * Copyright 2011-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n' +
                ' */\n',
        jqueryCheck: configBridge.config.jqueryCheck.join('\n'),
        jqueryVersionCheck: configBridge.config.jqueryVersionCheck.join('\n'),

        less: {
          compileCore: {
            options: {
              strictMath: true,
              sourceMap: false,
              outputSourceFiles: true,
              sourceMapURL: '<%= pkg.name %>.css.map',
              sourceMapFilename: 'css/<%= pkg.name %>.css.map'
            },
            src: 'less/custom-bootstrap.less',
            dest: 'css/<%= pkg.name %>.css'
          },
          compileTheme: {
            options: {
              strictMath: true,
              sourceMap: false,
              outputSourceFiles: true,
              sourceMapURL: '<%= pkg.name %>-theme.css.map',
              sourceMapFilename: 'css/<%= pkg.name %>-theme.css.map'
            },
            src: 'less/theme.less',
            dest: 'css/<%= pkg.name %>-theme.css'
          }
        },

        autoprefixer: {
          options: {
            browsers: configBridge.config.autoprefixerBrowsers
          },
          core: {
            options: {
              map: false
            },
            src: 'css/<%= pkg.name %>.css'
          },
          theme: {
            options: {
              map: false
            },
            src: 'css/<%= pkg.name %>-theme.css'
          }
        },

        csslint: {
          options: {
            csslintrc: '../../bower_components/bootstrap/less/.csslintrc'
          },
          dist: [
            'css/custom-bootstrap.css'
          ]
        },

        cssmin: {
          options: {
            compatibility: 'ie8',
            keepSpecialComments: '0',
            noAdvanced: true
          },
          minifyCore: {
            src: 'css/<%= pkg.name %>.css',
            dest: 'css/<%= pkg.name %>.min.css'
          },
          minifyTheme: {
            src: 'css/<%= pkg.name %>-theme.css',
            dest: 'css/<%= pkg.name %>-theme.min.css'
          }
        },

        usebanner: {
          options: {
            position: 'top',
            banner: '<%= banner %>'
          },
          files: {
            src: 'css/*.css'
          }
        },

        csscomb: {
          options: {
            config: '../../bower_components/bootstrap/less/.csscomb.json'
          },
          dist: {
            expand: true,
            cwd: 'css/',
            src: ['*.css', '!*.min.css'],
            dest: 'css/'
          }
        },

        watch: {
          less: {
            files: 'less/**/*.less',
            tasks: 'default'
          }
        }

    });

    // These plugins provide necessary tasks.
    require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
    require('time-grunt')(grunt);

    // Define your tasks here
    grunt.registerTask('default', ['less:compileCore', 'autoprefixer:core', 'usebanner', 'csscomb:dist', 'cssmin:minifyCore']);//'csslint',

    // CSS distribution task.
    grunt.registerTask('less-compile', ['less:compileCore', 'less:compileTheme']);
    grunt.registerTask('csslint', ['csslint:dist']);//esta dando erro
    grunt.registerTask('dist-css', ['less-compile', 'autoprefixer:core', 'autoprefixer:theme', 'usebanner', 'csscomb:dist', 'cssmin:minifyCore', 'cssmin:minifyTheme']);

};
