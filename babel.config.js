module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV);
  const isProductionMode = !!api.env('production');

  const presets = [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corejs: { version: 3, proposals: true },
      },
    ],
    [
      '@babel/preset-react',
      { development: !isProductionMode, runtime: 'automatic' },
    ],
    '@babel/preset-flow',
  ];

  const plugins = [
    [
      'prismjs',
      {
        languages: ['javascript', 'php', 'html'],
        plugins: ['line-numbers', 'show-language'],
      },
    ],
    'lodash',
    'macros',
    'babel-plugin-add-react-displayname',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-throw-expressions',
    '@babel/plugin-proposal-export-default-from',
    [
      '@babel/plugin-proposal-pipeline-operator',
      {
        proposal: 'minimal',
      },
    ],
    '@babel/plugin-proposal-do-expressions',
    '@babel/plugin-proposal-function-bind',
  ];

  if (isProductionMode) {
    plugins.push(
      ...[
        [
          'transform-react-remove-prop-types',
          {
            mode: 'wrap',
            ignoreFilenames: ['node_modules'],
          },
        ],
        [
          'transform-imports',
          {
            lodash: {
              transform: 'lodash/${member}',
              preventFullImport: true,
            },
            'react-router': {
              transform: 'react-router/${member}',
              preventFullImport: true,
            },
          },
        ],
      ],
    );
  }
  if (!isProductionMode) {
    plugins.push('react-refresh/babel');
  }

  return {
    presets,
    plugins,
  };
};
