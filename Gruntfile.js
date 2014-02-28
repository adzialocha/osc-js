'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    paths: {
      src: 'src',
      example: 'example',
      test: 'test',
      dist: 'dist'
    },

    /* configuration */

    watch: {
      js: {
        files: ['<%= paths.src %>/{,*/}*.js'],
        tasks: ['jshint', 'test']
      },
      jstest: {
        files: ['<%= paths.test %>/{,*/}*.js'],
        tasks: ['test']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      }
    },

    connect: {
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            '<%= paths.test %>',
            '<%= paths.src %>'
          ]
        }
      },
      server: {
        options: {
          port: 9000,
          hostname: '0.0.0.0',
          open: true,
          base: [
            '.tmp',
            '<%= paths.example %>',
            '<%= paths.src %>'
          ]
        }
      }
    },

    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= paths.dist %>/*',
            '!<%= paths.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= paths.src %>/{,*/}*.js'
      ]
    },

    jasmine: {
      dist: {
        src: '<%= paths.src %>/*.js',
        options: {
          specs: '<%= paths.test %>/*.js'
        }
      }
    },

    copy: {
      dist: {
        files: [
          {
            expand: true,
            flatten: true,
            src: [ '<%= paths.src %>/osc.js' ],
            dest: '<%= paths.dist %>'
          }
        ]
      }
    },

    uglify: {
      options: {
        mangle: true,
        compress: true,
        preserveComments: 'some',
        sourceMap: true
      },
      dist: {
        files: {
          '<%= paths.dist %>/osc.min.js': [ '<%= paths.src %>/osc.js' ]
        }
      }
    }
  });

  /* tasks */

  grunt.registerTask('serve', function () {
    grunt.task.run([
      'clean:server',
      'connect:server',
      'watch'
    ]);
  });

  grunt.registerTask('test', function(target) {

    if (target !== 'watch') {
      grunt.task.run([
        'clean:server'
      ]);
    }

    grunt.task.run([
      'connect:test',
      'jasmine'
    ]);

  });

  grunt.registerTask('build', [
    'clean:dist',
    'uglify:dist',
    'copy:dist'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
  ]);
};
