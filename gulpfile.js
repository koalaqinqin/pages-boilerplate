const gulp = require('gulp');
const { src, dest, parallel, series, watch } = gulp;

const del = require('del');
const loadPlugins = require('gulp-load-plugins');

const bs = require('browser-sync').create();
const plugins = loadPlugins();

// 页面模板里需要的数据
const data = require('./data');

// 删除生成的文件
const clean = () => {
    return del(['dist', 'temp']);
};

// src 里是读取流，dest是写入流，pipe把我们的输出写出去
// base 的作用是，是设定我们转化的基准路径，比如base: src,会把src 路径保留下来

// css 转化
const style = () => {
    return src('src/styles/*.scss', { base: 'src' })
        .pipe(plugins.sass(/*{ outputStyle: 'expanded' }*/))
        .pipe(dest('temp'));
};
// babel 处理 es5+
const script = () => {
    return src('src/assets/scripts/*.js', { base: 'src' })
      .pipe(plugins.babel({ presets: ['@babel/preset-env'] }))
      .pipe(dest('temp'));
};

// swig模板文件编译
const page = () => {
    return src('src/*.html')
        .pipe(plugins.swig({ data, defaults: { cache: false } }))
        .pipe(dest('temp'));
};

// 图片做一个压缩处理
const image = () => {
    return src('src/assets/images/**', { base: 'src' })
      .pipe(plugins.imagemin())
      .pipe(dest('dist'))
};

// 跟图片处理一样
const font = () => {
    return src('src/assets/fonts/**', { base: 'src' })
        .pipe(plugins.imagemin())
        .pipe(dest('dist'));
};

// 不需要处理的文件，直接拷贝
const extra = () => {
    return src('public/**', { base: 'public' })
        .pipe(dest('dist'));
};

// 监控文件变化
const serve = () => {
    watch('src/assets/styles/*.scss', style);
    watch('src/assets/scripts/*.js', script);
    watch('src/*.html', page);
    watch([
        'src/assets/images/**',
        'src/assets/fonts/**',
        'public/**'
    ], bs.reload); // 这些文件变化，自动更新浏览器，减少更新次数
  
    bs.init({
      notify: false,
      port: 8080,
      files: '/dist/**',
      server: {
          baseDir: ['temp', 'src', 'public'],
          routes: {
              '/node_modules': 'node_modules'
          }
      }
    })
};

// 资源有引用问题，html中构建注释处理
const useref = () => {
    return src('temp/*.html', { base: 'temp' })
        .pipe(plugins.useref({ searchPath: ['temp', '.'] }))
        // js css html
        .pipe(plugins.if(/\.js$/, plugins.uglify()))
        .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
        .pipe(plugins.if(/\.html$/, plugins.htmlmin({
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true
        })))
        .pipe(dest('dist'));
};
  
const compile = parallel(style, script, page); // 需要编译的

// 上线之前执行的任务， series 是顺序执行， parallel是并列执行
const build = series(
    clean,
    parallel(
        series(compile, useref),
        image,
        font,
        extra
    )
);

const develop = series(compile, serve);

module.exports = {
    page,
    image,
    style,
    script,
    serve,
    clean,
    build,
    develop,
};