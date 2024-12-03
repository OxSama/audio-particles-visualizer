const isBundling = process.env.NODE_ENV === 'production';

module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current',
      },
      // Disable module transformation during bundling
      modules: isBundling ? false : 'commonjs'
    }],
  ],
  plugins: [
    !isBundling && '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-runtime'
  ].filter(Boolean)
};