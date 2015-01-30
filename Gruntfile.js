/*******************************************************************************
 * 
 * Gruntfile.js
 * 
 * @author andre-lehnert
 * @version 1.0.0
 * @url http://andre-lehnert.de/?p=35
 * @url https://github.com/andre-lehnert/tutorial-grunt
 * 
 *******************************************************************************
 */

var path = require('path');

module.exports = function(grunt) {

// auto include tasks
require('load-grunt-tasks')(grunt);

// default file encoding
grunt.file.defaultEncoding = 'utf8';


/*******************************************************************************
 * 
 * Grunt-Tasks
 * 
 * Tasks can be grouped and sorted 
 * 
 *******************************************************************************
 */

/*
 * Step 0: (Optional) Print config
 */
grunt.registerTask('config', function () {
    console.log(grunt.config.data);
});

/*
 * Step 1: Init project folders, dummy files and bower-dependencies
 */
grunt.registerTask('init', [
                                'gitignore', 
                                'mkdir', 
                                'bower', 
                                'generate-dummies'
                            ]);

/*
 * Step 2: Build project
 * 
 * - concat css and js files
 * - minimize css, js and html files
 * - minimize images
 * - delete unused code, comments, ...
 */
grunt.registerTask('build', ['clean:dist', 'update']);

/*
 * Step 3: Update build
 */
grunt.registerTask('update', [
                                'newer:jshint', 
                                'concurrent:src', 
                                'concurrent:misc', 
                                'htmlmin'
                            ]);
                            
grunt.registerTask('default', ['update']); // Alias

/*
 * Step 4: Automatic deploy
 * 
 * - open ftp connection and upload dist/ folder
 */
grunt.registerTask('deploy', ['ftp-deploy']);




/*******************************************************************************
 * 
 * Grunt-Configuration
 * 
 *******************************************************************************
 */
grunt.initConfig(
{
    // Node.js configuration file
    pkg: grunt.file.readJSON('package.json'),    
    ftpPass: grunt.file.readJSON('.ftppass'),

    /*
     * npm install grunt-mkdir --save-dev
     * grunt.loadNpmTasks('grunt-mkdir');
     * @url https://www.npmjs.com/package/grunt-mkdir
     */
    mkdir: {
        all: {
            options: {
                mode: 0750,
                create: [   
                            '<%= pkg.name %>/src/img', 
                            '<%= pkg.name %>/src/js', 
                            '<%= pkg.name %>/src/js/<%= pkg.name %>', 
                            '<%= pkg.name %>/src/css', 
                            '<%= pkg.name %>/src/css/<%= pkg.name %>', 
                            '<%= pkg.name %>/test'
                        ]
            }
        }
    },
    
    /*
     * npm install grunt-contrib-jshint --save-dev
     * grunt.loadNpmTasks('grunt-contrib-jshint');
     * @url https://github.com/gruntjs/grunt-contrib-jshint
     */
    jshint: {
        files: [
                    'Gruntfile.js', 
                    '<%= pkg.name %>/src/js/**/*.js', 
                    '<%= pkg.name %>/test/**/*.js'
                ],
        options: {
            eqeqeq: true,
            noempty: true,
            nonbsp: true,
            //strict: true,
            undef: true,
            unused: true,
            globals: {
                jQuery: true,
                console: true,
                module: true,
                require: true
            },
            reporter: require('jshint-stylish')
        }
    },
    
     /*
     * npm install grunt-contrib-concat --save-dev
     * grunt.loadNpmTasks('grunt-contrib-concat');
     * @url https://github.com/gruntjs/grunt-contrib-concat
     */
    concat: {
        options: {
            separator: '\n'
        },
        dist: {
            src: '<%= pkg.name %>/dist/js/*.min.js',
            dest: '<%= pkg.name %>/dist/js/<%= pkg.name %>.min.js'
        },
        css: {
            src: '<%= pkg.name %>/src/css/<%= pkg.name %>/*.css',
            dest: '<%= pkg.name %>/src/css/<%= pkg.name %>.css'
        },
        js: {
            src: '<%= pkg.name %>/src/js/<%= pkg.name %>/*.js',
            dest: '<%= pkg.name %>/src/js/<%= pkg.name %>.js'
        }
    },
    
     /*
     * npm install grunt-contrib-uglify --save-dev
     * grunt.loadNpmTasks('grunt-contrib-uglify');
     * @url https://github.com/gruntjs/grunt-contrib-uglify
     */
    uglify: {
        options: {
            banner: '/*! <%= pkg.name %> (<%= pkg.repository.url %>) */\n'
        },
        src: {
            src: '<%= pkg.name %>/src/js/<%= pkg.name %>.js',
            dest: '<%= pkg.name %>/dist/js/<%= pkg.name %>.min.js'
        },
        lib: {
            files: [{
                    expand: true,
                    cwd: '<%= pkg.name %>/src/lib/js',
                    src: '**/*.js',
                    dest: '<%= pkg.name %>/dist/js',
                    ext: '.min.js'
                }]
        }
    },
    
     /*
     * npm install grunt-processhtml --save-dev
     * grunt.loadNpmTasks('grunt-processhtml');
     * @url https://www.npmjs.com/package/grunt-processhtml
     */   
    processhtml: {
        options: {
            data: {
                title: '<%= pkg.name %> <%= pkg.version %>'
            }
        },
        dist: {
            files: {
                '<%= pkg.name %>/dist/index.html': ['<%= pkg.name %>/src/index.html']
            }
        }
    },
    
     /*
     * npm install grunt-contrib-copy --save-dev
     * grunt.loadNpmTasks('grunt-contrib-copy');
     * @url https://github.com/gruntjs/grunt-contrib-copy
     */
    copy: {
        main: {
            files: [
                {
                    expand: true, 
                    flatten: true, 
                    src: ['<%= pkg.name %>/src/lib/fonts/*'], 
                    dest: '<%= pkg.name %>/dist/fonts/', 
                    filter: 'isFile'
                }
            ]
        }
    },
    
     /*
     * npm install grunt-contrib-clean --save-dev
     * grunt.loadNpmTasks('grunt-contrib-clean');
     * @url https://github.com/gruntjs/grunt-contrib-clean
     */
    clean: {
        dist: ["<%= pkg.name %>/dist"],
        js: ["<%= pkg.name %>/dist/js/*.js", "!<%= pkg.name %>/dist/js/<%= pkg.name %>.min.js"],
        css: ["<%= pkg.name %>/dist/css/*.css", "!<%= pkg.name %>/dist/css/*.min.css"]
    },
    
     /*
     * npm install grunt-uncss --save-dev
     * grunt.loadNpmTasks('grunt-uncss');
     * @url https://github.com/addyosmani/grunt-uncss
     */
    uncss: {
        dist: {
            files: {
                '<%= pkg.name %>/dist/css/<%= pkg.name %>.css': ['<%= pkg.name %>/src/index.html']
            }
        }
    },
    
     /*
     * npm install grunt-contrib-cssmin --save-dev
     * grunt.loadNpmTasks('grunt-contrib-cssmin');
     * @url https://github.com/gruntjs/grunt-contrib-cssmin
     */
    cssmin: {
        target: {
            files: {
                '<%= pkg.name %>/dist/css/<%= pkg.name %>.min.css': ['<%= pkg.name %>/dist/css/<%= pkg.name %>.css']
            }
        }
    },
    
     /*
     * npm install grunt-contrib-htmlmin --save-dev
     * grunt.loadNpmTasks('grunt-contrib-htmlmin');
     * @url https://github.com/gruntjs/grunt-contrib-htmlmin
     */
    htmlmin: {
        dist: {
            options: {
                removeComments: true,
                collapseWhitespace: true
            },
            files: {
                '<%= pkg.name %>/dist/index.html': '<%= pkg.name %>/src/index.html'
            }
        }

    },
    
     /*
     * npm install grunt-ftp-deploy --save-dev
     * grunt.loadNpmTasks('grunt-ftp-deploy');
     * @url https://github.com/zonak/grunt-ftp-deploy
     * 
     * @see .ftppass file 
     */
    'ftp-deploy': {
        build: {
            auth: {
                host: '<%= ftpPass.host %>',
                port: '<%= ftpPass.port %>',
                authKey: '<%= ftpPass.user %>'
            },
            src: '<%= pkg.name %>/dist',
            dest: '<%= ftpPass.target %>'//,
            // exclusions: ['path/to/source/folder/**/.DS_Store', 'path/to/source/folder/**/Thumbs.db', 'path/to/dist/tmp']
        }
    },
    
     /*
     * npm install grunt-contrib-imagemin --save-dev
     * grunt.loadNpmTasks('grunt-contrib-imagemin');
     * @url https://github.com/gruntjs/grunt-contrib-imagemin
     */
    imagemin: {
        png: {
            options: {
                optimizationLevel: 7
            },
            files: [
                {
                    expand: true,
                    cwd: '<%= pkg.name %>/src/img/',
                    src: ['**/*.png'],
                    dest: '<%= pkg.name %>/dist/img/',
                    ext: '.png'
                }
            ]
        },
        jpg: {
            options: {
                progressive: true
            },
            files: [
                {
                    expand: true,
                    cwd: '<%= pkg.name %>/src/img/',
                    src: ['**/*.jpg'],
                    dest: '<%= pkg.name %>/dist/img/',
                    ext: '.jpg'
                }
            ]
        },
        gif: {
            options: {
                interlaced: true
            },
            files: [
                {
                    expand: true,
                    cwd: '<%= pkg.name %>/src/img/',
                    src: ['**/*.jpg'],
                    dest: '<%= pkg.name %>/dist/img/',
                    ext: '.jpg'
                }
            ]
        }
    },
    
     /*
     * npm install --save-dev grunt-concurrent
     * grunt.loadNpmTasks('grunt-processhtml');
     * @url https://github.com/sindresorhus/grunt-concurrent
     */
    concurrent: {
        src: {
            tasks: ['compile'],
            options: {
                logConcurrentOutput: false
            }
        },
        misc: {
            tasks: ['newer:copy', 'newer:imagemin', 'clean:js', 'clean:css'],
            options: {
                logConcurrentOutput: false
            }
        }
    },
    
     /*
     * npm install grunt-contrib-watch --save-dev
     * grunt.loadNpmTasks('grunt-contrib-watch');
     * @url https://github.com/gruntjs/grunt-contrib-watch
     */
    bower: {
        install: {
            options: {
                targetDir: '<%= pkg.name %>/src/lib',
                layout: function (type, component, source) {

                    if (source.indexOf("/js/") > -1 ||
                            source.indexOf(".js") > -1) {
                        
                        return path.join("js", "");

                    } else if (source.indexOf("/css/") > -1 || 
                            source.indexOf(".css") > -1) {
                        
                        return path.join("css", "");

                    } else if (source.indexOf("/fonts/") > -1) {
                        return path.join("fonts", "");

                    } else {
                        return path.join("", "");
                    }

                },
                install: true,
                verbose: false,
                cleanTargetDir: true,
                cleanBowerDir: true,
                bowerOptions: {}
            }
        }
    },
    
    
     /*
     * npm install grunt-processhtml --save-dev
     * grunt.loadNpmTasks('grunt-processhtml');
     * @url https://www.npmjs.com/package/grunt-processhtml
     */
    watch: {
        files: [
                    '<%= jshint.files %>', 
                    '<%= pkg.name %>/src/js/**/*.js', 
                    '<%= concat.css.src %>', 
                    '<%= pkg.name %>/src/*.html'
                ],
        tasks: ['update', 'deploy']
    }
    
    /*
     * npm install grunt-newer --save-dev
     * grunt.loadNpmTasks('grunt-newer');
     * @url https://www.npmjs.com/package/grunt-newer
     */
});


/*******************************************************************************
 * 
 * Additional Grunt-Tasks
 * 
 *******************************************************************************
 */

/*
 * Minimalization tasks
 */
grunt.registerTask('compile', [
                                'newer:uncss', 
                                'newer:cssmin', 
                                'clean:css', 
                                'newer:processhtml', 
                                'newer:htmlmin',
                                'newer:uglify',
                                'concat:dist'
                            ]);


/*
 * Generate .gitignore
 * 
 * @see grunt init
 */
grunt.registerTask('gitignore', function () {

    var msg = "node_modules\n" +
            grunt.config.data.pkg.name + "/dist\n" +
            ".npm-debug\n" +
            ".log\n" +
            ".ftppass\n" +
            ".ftpconf\n" +
            "tmp";

    grunt.file.write('.gitignore', msg);

});

/*
 * Generate example index.html, main.css, main.js files
 * 
 * @see grunt init
 */
grunt.registerTask('generate-dummies', function () {

    var pkgName = grunt.config.data.pkg.name;

    var msg = '<!DOCTYPE html>\n' +
            "<html>\n" +
            " <head>\n" +
            "  <meta charset=\"UTF-8\">\n" +
            "  <title></title>\n" +
            "  <!-- build:css css/" + pkgName + ".min.css -->\n" +
            "  <link rel=\"stylesheet\" href=\"lib/css/bootstrap.css\">\n" +
            "  <link rel=\"stylesheet\" href=\"css/" + pkgName + "/main.css\">\n" +
            "  <!-- /build -->\n" +
            " </head>\n" +
            " <body>\n" +
            "  Hallo Welt!\n" +
            " </body>\n" +
            " <!-- build:js js/" + pkgName + ".min.css -->\n" +
            " <script src=\"lib/js/jquery.js\"></script>\n" +
            " <script src=\"lib/js/bootstrap.js\"></script>\n" +
            " <script src=\"js/" + pkgName + "/main.js\"></script>\n" +
            " <!-- /build -->\n" +
            "</html>";

    grunt.file.write(pkgName + "/src/index.html", msg);

    var path = pkgName + "/src/css/" + pkgName + "/main.css";
    grunt.file.write(path, "");

    path = pkgName + "/src/js/" + pkgName + "/main.js";
    grunt.file.write(path, "");

});

};
