const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
// const ESLintPlugin = require('eslint-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const { createHash } = require('crypto');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const autoPrefixer = require('autoprefixer');
const postcssNormalize = require('postcss-normalize');
const postCssPresetEnv = require('postcss-preset-env');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

// const BundleAnalyzerPlugin =
//   require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyPlugin = require('copy-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const fs = require('fs');
const cloneDeep = require('lodash.clonedeep');

const evalSourceMapMiddleware = require('./evalSourceMapMiddleware');
const redirectServedPath = require('./redirectServedPathMiddleware');
const noopServiceWorkerMiddleware = require('./noopServiceWorkerMiddleware');

const envFilePath = path.resolve(__dirname, 'env.js');
const sourcePath = path.join(__dirname, 'src');
const assetsPath = path.join(sourcePath, 'assets');
const buildPath = path.join(__dirname, 'dist');

const getEnvHash = (env) => {
  const hash = createHash('md5');
  hash.update(JSON.stringify(env));

  return hash.digest('hex');
};

module.exports = (env = {}, argv = {}) => {
  const { mode = 'production' } = argv || {};
  const envHash = getEnvHash({ ...env, argv });
  const COMMIT_SHA = env.COMMIT_SHA || 'local';
  const isProductionMode = mode === 'production';
  const isDevelopmentMode = mode === 'development';
  let envFileExists;

  let config = {
    mode,
    bail: isProductionMode,
    context: sourcePath,
    devtool: isProductionMode ? 'source-map' : 'source-map',
    entry: {
      app: {
        import: path.resolve(sourcePath, 'entrypoint.js'),
        dependOn: 'vendor',
      },
      vendor: [
        'react',
        'react-dom',
        isDevelopmentMode && 'react-refresh/runtime',
      ].filter(Boolean),
    },
    output: {
      path: buildPath,
      pathinfo: isDevelopmentMode,
      filename: isProductionMode
        ? `${COMMIT_SHA}/assets/js/[name].[contenthash:8].js`
        : isDevelopmentMode && `${COMMIT_SHA}/assets/js/[name].js`,
      chunkFilename: isProductionMode
        ? `${COMMIT_SHA}/assets/js/[name]-[contenthash:8].chunk.js`
        : isDevelopmentMode &&
          `${COMMIT_SHA}/assets/js/[contenthash:8].chunk.js`,
      assetModuleFilename: isProductionMode
        ? `${COMMIT_SHA}/assets/media/[name]-[contenthash:8][ext]`
        : `${COMMIT_SHA}/assets/media/[name][ext]`,

      cssChunkFilename: isProductionMode
        ? `${COMMIT_SHA}/assets/css/[id]-[contenthash:8].chunk.css`
        : `${COMMIT_SHA}/assets/css/[id].chunk.css`,
      cssFilename: isProductionMode
        ? `${COMMIT_SHA}/assets/css/[name]-[contenthash:8].css`
        : `${COMMIT_SHA}/assets/css/[name].css`,
      publicPath: '/',
      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: isProductionMode
        ? (info) =>
            path
              .relative(sourcePath, info.absoluteResourcePath)
              .replace(/\\/g, '/')
        : (info) => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    },
    cache: {
      type: 'filesystem',
      version: envHash,
      cacheDirectory: path.join(__dirname, '.yarn/.cache'),
      store: 'pack',
      buildDependencies: {
        defaultWebpack: ['webpack/lib/'],
        config: [__filename],
      },
    },
    // infrastructureLogging: {
    //   level: 'none',
    // },
    module: {
      strictExportPresence: true,
      rules: [
        {
          test: /\.(styl)$/,
          use: [
            isDevelopmentMode && 'css-hot-loader',
            {
              // Extracts CSS to a separate file
              loader: MiniCssExtractPlugin.loader,
            },
            {
              // Translates CSS into CommonJS
              loader: 'css-loader',
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: isProductionMode,
                postcssOptions: {
                  config: false,
                  plugins: [
                    postCssPresetEnv,
                    autoPrefixer({
                      context: sourcePath,
                    }),
                    postcssNormalize(),
                  ],
                },
              },
            },
            {
              loader: 'stylus-native-loader',
            },
          ].filter(Boolean),
          // Don't consider CSS imports dead code even if the
          // containing package claims to have no side effects.
          // Remove this when webpack adds a warning or an error for this.
          // See https://github.com/webpack/webpack/issues/6571
          sideEffects: true,
        },
        {
          test: /\.css$/,
          use: [
            {
              // Extracts CSS to a separate file
              loader: MiniCssExtractPlugin.loader,
            },
            {
              // Translates CSS into CommonJS
              loader: 'css-loader',
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: isProductionMode,
                postcssOptions: {
                  config: false,
                  plugins: [
                    postCssPresetEnv,
                    autoPrefixer({
                      context: sourcePath,
                    }),
                    postcssNormalize(),
                  ],
                },
              },
            },
          ].filter(Boolean),
          // Don't consider CSS imports dead code even if the
          // containing package claims to have no side effects.
          // Remove this when webpack adds a warning or an error for this.
          // See https://github.com/webpack/webpack/issues/6571
          sideEffects: true,
        },
        {
          test: /env\.js$/,
          loader: 'file-loader',
          generator: {
            filename: 'env.js',
          },
        },
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          include: sourcePath,
          use: [
            {
              loader: 'babel-loader',
              options: {
                exclude: [
                  // \\ for Windows, / for macOS and Linux
                  /.yarn[\\/]core-js/,
                  /.yarn[\\/]webpack[\\/]buildin/,
                ],
                plugins: [
                  isDevelopmentMode && require.resolve('react-refresh/babel'),
                ].filter(Boolean),
                // // This is a feature of `babel-loader` for webpack (not Babel itself).
                // // It enables caching results in ./node_modules/.cache/babel-loader/
                // // directory for faster rebuilds.
                // cacheDirectory: true,
                // // // See #6846 for context on why cacheCompression is disabled
                // cacheCompression: false,
                compact: isProductionMode,
              },
            },
          ],
        },
        {
          test: /\.(jpe?g|svg|png|gif|ico|eot|ttf|woff2?)(\?v=\d+\.\d+\.\d+)?$/i,
          exclude: [
            /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
            /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
          ],
          type: 'asset/resource',
          generator: {
            filename: `${COMMIT_SHA}/assets/media/[name]-[contenthash:8][ext][query]`,
          },
        },
        // "file" loader makes sure those assets get served by WebpackDevServer.
        // When you `import` an asset, you get its (virtual) filename.
        // In production, they would get copied to the `build` folder.
        // This loader doesn't use a "test" so it will catch all modules
        // that fall through the other loaders.
        {
          // Exclude `js` files to keep "css" loader working as it injects
          // its runtime that would otherwise be processed through "file" loader.
          // Also exclude `html` and `json` extensions so they get processed
          // by webpacks internal loaders.
          exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
          type: 'asset/resource',
        },
      ],
    },
    resolve: {
      alias: {
        // moment: path.resolve(__dirname, '.yarn/moment/min/moment.min.js')
      },
    },
    plugins: [
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment/,
      }),
      isDevelopmentMode && new CaseSensitivePathsPlugin(),
      new RemoveEmptyScriptsPlugin({ enabled: isProductionMode === true }),
      new webpack.DefinePlugin({
        'process.env': Object.keys(env).reduce((envObject, key) => {
          return { ...envObject, [key]: JSON.stringify(env[key]) };
        }, {}),
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(assetsPath, 'index.html'),
        filename: 'index.html',
        inject: true,
        ...(isProductionMode
          ? {
              minify: {
                removeComments: true,
                removeCommentsFromCDATA: true,
                removeCDATASectionsFromCDATA: true,
                collapseWhitespace: true,
                collapseBooleanAttributes: true,
                removeAttributeQuotes: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeScriptTypeAttributes: true,
                caseSensitive: true,
                minifyJS: true,
                minifyCSS: true,
              },
            }
          : {}),
      }),
      isProductionMode &&
        new FaviconsWebpackPlugin({
          logo: path.resolve(assetsPath, 'favicon/logo.png'),
          mode: 'webapp',
          devMode: 'light',
          cache: true,
          inject: true,
          prefix: 'favicon/',
          publicPath: '/',
          icons: {
            android: false,
            appleIcon: false,
            appleStartup: false,
            favicons: true,
            windows: false,
            yandex: false,
          },
        }),
      isDevelopmentMode &&
        new ReactRefreshWebpackPlugin({
          overlay: false,
        }),

      new MiniCssExtractPlugin({
        // runtime: false,
        filename: isProductionMode
          ? `${COMMIT_SHA}/assets/css/[name].[contenthash:8].css`
          : `${COMMIT_SHA}/assets/css/[name].css`,
        chunkFilename: isProductionMode
          ? `${COMMIT_SHA}/assets/css/[id].[contenthash:8].css`
          : `${COMMIT_SHA}/assets/css/[id].css`,
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(sourcePath, 'assets/robots.txt'),
            to: './',
          },
          {
            from: envFilePath,
            to: './',
          },
        ],
      }),
      isProductionMode &&
        new WebpackManifestPlugin({
          fileName: 'asset-manifest.json',
          publicPath: '/',
          generate: (seed, files, entrypoints) => {
            const manifestFiles = files.reduce((manifest, file) => {
              const newManifest = cloneDeep(manifest);
              newManifest[file.name] = file.path;
              return newManifest;
            }, seed);
            const entrypointFiles = entrypoints.app.filter(
              (fileName) => !fileName.endsWith('.map'),
            );

            return {
              files: manifestFiles,
              entrypoints: entrypointFiles,
            };
          },
        }),
      isProductionMode &&
        new WorkboxWebpackPlugin.InjectManifest({
          swSrc: path.resolve(sourcePath, 'service-worker.js'),
          dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
          exclude: [/\.map$/, /asset-manifest\.json$/, /env\.js$/, /LICENSE/],
          // Bump up the default maximum size (2mb) that's precached,
          // to make lazy-loading failure scenarios less likely.
          // See https://github.com/cra-template/pwa/issues/13#issuecomment-722667270
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        }),
      isProductionMode && {
        apply: (compiler) => {
          compiler.hooks.beforeRun.tap('envManagerBeforeRun', () => {
            if ((envFileExists = fs.existsSync(envFilePath))) return;

            fs.copyFile(`${envFilePath}.example`, envFilePath, (err) => {
              if (err) throw err;
              console.log('env.js: stub created');
            });
          });
          compiler.hooks.done.tap('envManagerAfterRun', () => {
            if (envFileExists) return;

            fs.unlink(envFilePath, (err) => {
              if (err) throw err;
              console.log('env.js: stub removed');
            });
          });
        },
      },
    ].filter(Boolean),
    optimization: {
      runtimeChunk: 'single',
      minimize: isProductionMode,
      minimizer: [
        // This is only used in production mode
        isProductionMode &&
          new TerserPlugin({
            terserOptions: {
              parse: {
                // We want terser to parse ecma 8 code. However, we don't want it
                // to apply any minification steps that turns valid ecma 5 code
                // into invalid ecma 5 code. This is why the 'compress' and 'output'
                // sections only apply transformations that are ecma 5 safe
                // https://github.com/facebook/create-react-app/pull/4234
                ecma: 8,
              },
              compress: {
                ecma: 5,
                warnings: false,
                // Disabled because of an issue with Uglify breaking seemingly valid code:
                // https://github.com/facebook/create-react-app/issues/2376
                // Pending further investigation:
                // https://github.com/mishoo/UglifyJS2/issues/2011
                comparisons: false,
                // Disabled because of an issue with Terser breaking valid code:
                // https://github.com/facebook/create-react-app/issues/5250
                // Pending further investigation:
                // https://github.com/terser-js/terser/issues/120
                inline: 2,
              },
              mangle: {
                safari10: true,
              },
              // Added for profiling in devtools
              keep_classnames: isProductionMode,
              keep_fnames: isProductionMode,
              output: {
                ecma: 5,
                comments: false,
                // Turned on because emoji and regex is not minified properly using default
                // https://github.com/facebook/create-react-app/issues/2488
                ascii_only: true,
              },
            },
          }),
        // This is only used in production mode
        new CssMinimizerPlugin({
          // exclude: /prism/,
          minimizerOptions: {
            plugins: ['autoprefixer', 'postcss-preset-env'],
            minify: [
              CssMinimizerPlugin.cssnanoMinify,
              CssMinimizerPlugin.cleanCssMinify,
              CssMinimizerPlugin.esbuildMinify,
            ],
            preset: [
              'default',
              {
                discardComments: false,
                discardEmpty: false,
                mergeIdents: true,
              },
            ],
          },
        }),
      ].filter(Boolean),
    },
  };

  if (isDevelopmentMode) {
    config = {
      ...config,
      devServer: {
        client: { overlay: false },
        historyApiFallback: true,
        port: 5014,
        hot: true,
        setupMiddlewares: (middlewares, devServer) => {
          if (!devServer) {
            throw new Error('webpack-dev-server is not defined');
          }

          middlewares.push(
            evalSourceMapMiddleware(devServer),
            redirectServedPath('/'),
            noopServiceWorkerMiddleware('/'),
          );

          return middlewares;
        },
      },
    };
  }
  // config.plugins.push(new BundleAnalyzerPlugin());
  return config;
};
