const autoprefixer = require('autoprefixer');
const path = require('path');
const postcssNormalize = require('postcss-normalize');

const sourcePath = path.join(__dirname, 'src');

module.exports = {
  plugins: [
    autoprefixer({
      context: sourcePath
    }),
    postcssNormalize(/* pluginOptions */)
  ]
};
