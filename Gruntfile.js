module.exports = function(grunt) {

    require("load-grunt-tasks")(grunt); // npm install --save-dev load-grunt-tasks

    grunt.initConfig({
        "babel": {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    "src/*.js": "dist/*.js"
                }
            }
        },
        watch: {
            babel: {
                // We watch and compile sass files as normal but don't live reload here
                files: ['src/*.js'],
                tasks: ['babel'],
            },
        }
    });

    grunt.registerTask("default", ["babel", "watch"]);
};