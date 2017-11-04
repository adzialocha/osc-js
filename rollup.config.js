import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import cleanup from 'rollup-plugin-cleanup'

const options = {
  entry: 'entry/osc.js',
  dest: 'lib/osc.js',
  sourceMap: false,
  moduleName: 'OSC',
  plugins: [
    babel({
      babelrc: false,
      presets: ['es2015-rollup'],
      runtimeHelpers: false,
      externalHelpers: false,
      exclude: 'node_modules/**',
    }),
    cleanup(),
  ],
  format: 'umd',
}

export default [
  options,
  Object.assign({}, options, {
    entry: 'entry/osc.browser.js',
    dest: 'lib/osc.browser.js',
  }),
  Object.assign({}, options, {
    entry: 'entry/osc.browser.js',
    dest: 'dist/osc.js',
    sourceMap: true,
  }),
  Object.assign({}, options, {
    entry: 'entry/osc.browser.js',
    dest: 'dist/osc.min.js',
    plugins: options.plugins.concat(uglify()),
  }),
]
