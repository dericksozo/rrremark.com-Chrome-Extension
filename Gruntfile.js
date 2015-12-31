module.exports = function(grunt) {

    require("load-grunt-tasks")(grunt); // npm install --save-dev load-grunt-tasks

    grunt.initConfig({
        browserify: {
            options: {
                browserifyOptions: {
                    debug: true
                },
                "transform": [
                    [
                        "hbsfy",
                        {
                            "extensions": [
                                "hbs"
                            ],
                            "precompilerOptions": {
                                "knownHelpersOnly": true,
                                "knownHelpers": {
                                    "myUltimateHelper": true
                                }
                            }
                        }
                    ]
                ]
            },
            dist: {
                files: {
                    'dist/content_script.js': ['src/index.js'],
                    'dist/eventPage.js': ['src/eventPage.js']
                }
            }
        },
        watch: {
            browserify: {
                files: ['src/*.js'],
                tasks: ['browserify'],
            },
        }
    });

    grunt.registerTask("default", ["browserify", "watch"]);
};