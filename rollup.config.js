const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const terser = require('@rollup/plugin-terser');

const packageJson = require('./package.json');

module.exports = [
  // UMD build (for browsers)
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/audio-visualizer.min.js',
        format: 'umd',
        name: 'AudioVisualizer',
        plugins: [terser()],
        sourcemap: true
      },
      {
        file: 'dist/audio-visualizer.js',
        format: 'umd',
        name: 'AudioVisualizer',
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', {
            targets: {
              browsers: ['last 2 versions', 'not dead']
            }
          }],
        ],
        plugins: [
            ['@babel/plugin-transform-runtime', {
              useESModules: true, // Enables tree-shaking
              regenerator: true   // Supports async/await
            }]
          ]
      })
    ]
  },
  // ESM build (for bundlers)
  {
    input: 'src/index.js',
    output: [
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', {
            targets: {
              browsers: ['last 2 versions', 'not dead']
            }
          }]
        ],
        plugins: [
          ['@babel/plugin-transform-runtime', {
            useESModules: true,
            regenerator: true
          }]
        ]
      })
    ]
  }
];