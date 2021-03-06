/// <binding AfterBuild='jasmine_node:auto' />
'use strict';

/*globals initConfig, appPath */
/*jshint camelcase: false */


module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig(
      {
        pkg: grunt.file.readJSON('package.json'),

        yuidoc: {
          compile: {
            linkNatives: "true",
            name: '<%= pkg.name %>',
            description: '<%= pkg.description %>',
            version: '<%= pkg.version %>',
            url: '<%= pkg.homepage %>',
            options: {
              paths: ['./src'],
              outdir: 'doc'
            }
          }
        },

        watch: {
          files: ['src/*.js'],
          tasks: ['karma:unit:run'],
          options: {
            livereload: true
          }
        },

        jasmine_node: {
          all: [],
          options: {
            coffee: false,
            verbose: true,
            match: '.',
            matchall: false,
            specFolders: ['./test/spec/'],
            projectRoot: '',
            //growl:true,
            //specNameMatcher: 'spec',
            forceExit: false,

            jUnit: {
              report: true,
              savePath: "./build/reports/jasmine/",
              useDotNotation: true,
              consolidate: true
            }
          },
          single: {
            options: {
              specFolders: ['./test/spec/'],
              autotest: false
            }
          },
          auto: {
            options: {
              autotest: true,
              forceExit: false
            }
          }

        }
      }
  );

  grunt.registerTask('test', ['jasmine_node:single']);
  grunt.registerTask('default', ['test']);
};
