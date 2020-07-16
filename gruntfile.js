const sass = require('sass');
const loadGruntTasks = require('load-grunt-tasks'); // 自动加载所有的 grunt 插件中的任务

module.exports = function(grunt) {
    grunt.initConfig({
        clean: {
            build: {
                src: ['grunt/**/*']
            }
        },
        sass: { // Task
            options: {
                implementation: sass, // 使用sass模块来编译scss文件
                sourceMap: false
            },
            dist: {         
              files: [{
                  // Set to true for recursive search
                  expand: true,
                  cwd: 'src/assets/styles/',
                  src: ['**/*.scss'],
                  dest: 'grunt/assets/styles/',
                  ext: '.css'
              }]
            }
        },
        babel: {
            options: {
                sourceMap: false,
                presets: ['@babel/preset-env']
            },
            dist: {
                files: [{
                    expand:true,
                    cwd: 'src/assets/scripts/',     //js目录下
                    src: '**/*.js',  //所有js文件
                    dest: 'grunt/assets/scripts/'  //输出到此目录下
                }]
            }
        },
        watch: {
            js: {
                files: ['src/assets/scripts/*.js'],
                tasks: ['babel']
            },
            css: {
                files: ['src/assets/styles/*.scss'],
                tasks: ['sass']
            }
        }

    });

    loadGruntTasks(grunt);  // 自动加载所有的 grunt 插件中的任务

    grunt.registerTask('default',['clean', 'sass', 'babel', 'watch']);
    // 默认会执行default任务，然后执行sass、babel、watch
}