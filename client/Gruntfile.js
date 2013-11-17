module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		app: "src",
		public: "dist",
		//	validate JS
		jshint: {
			all: [
				"Gruntfile.js", "<%= app %>/**/*.js"
			]
		},
		//	concat
		concat: {
			options: {
				banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				stripBanners: true
			},
			dist: {
				src: '<%= app %>/**/*.js',
				dest: '<%= public %>/<%= pkg.name %>.js'
			}
		},
		//	minify
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: '<%= public %>/<%= pkg.name %>.js',
				dest: '<%= public %>/<%= pkg.name %>.min.js'
			}
		}
	});

	// Load project tasks
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	
	// Default task(s).
	grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
};