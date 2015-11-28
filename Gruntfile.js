module.exports = function(grunt) {

    require("load-grunt-tasks")(grunt); // npm install --save-dev load-grunt-tasks

    grunt.initConfig({
        "babel": {
            options: {
                sourceMap: true,
                presets: ['es2015']
            },
            dist: {
                files: {
                    "dist/content_script.js": "src/content_script.js",
                    "dist/eventPage.js": "src/eventPage.js"
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