'use strict';

module.exports = function (grunt) {
	var port = 9000,
		karmarPort = 9876,
		karmarRunnerPort = 9002;

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-karma');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		connect: {
			options: {
				hostname: 'localhost',
				keepalive: true,
				port: port
			},
			dev: {
				options: {
					//base: 'root',
					/*{
						path:'demo',
						options: {
							index:'demo.html'
						}
					},*/
					open: true
				}
			}
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				eqnull: true,
				browser: true,
				node: true,
				globals: {
					// module: true,
				}
			},
			all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
		},
		uglify: {
			options: {
				banner:'/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> \n' +
				'Author: <%= pkg.author.name %>\n' +
				'Email: <%= pkg.author.email %>\n*/'
			},
			build: {
				files: {
					'dist/<%= pkg.name %>.min.js': ['src/<%= pkg.name %>.js']
				}
			}
		},

		karma: {
			options: {
				autoWatch: false,
				browsers: ["PhantomJS"],
				colors: true,
				files: [
					'src/*.js',
					'test/*.js',
					{pattern: 'test/fixture/*.html', watched: true, served: true, included: false},
					{pattern: 'test/fixture/*.json', watched: true, served: true, included: false}
				],
				frameworks: ["jasmine"],
				port: karmarPort,
				reporters: ['progress'],
				singleRun: true
			},
			build: {
				browsers: ["Chrome"],
			},
			unit: {
				//background: true,
				autoWatch:true,
				browsers: ["Chrome"],
				singleRun: false
			}

		},

		watch: {
			unittest: {
				files: ['src/*.js', 'test/*.js'],
				tasks: ['karma:unit:run']
			},
			js: {
				files: ['src/*.js'],
				tasks: ['jshint']
			}
		}
	});


	grunt.registerTask('build', [
		'jshint',
		'karma:build',
		'uglify'
	]);

	grunt.registerTask('test', [
		// 'karma'
		'karma:unit'
	]);

	grunt.registerTask('lint', [
		'jshint:all'
	]);
	grunt.registerTask('start', [
		'connect:dev'
	]);


};
