import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'

const options = {
  entry: 'index.js',
  dest: 'lib/osc.js',
  sourceMap: true,
  moduleName: 'OSC',
  plugins: [
    babel({
      babelrc: false,
      presets: ['es2015-rollup'],
      runtimeHelpers: false,
      externalHelpers: false,
      exclude: 'node_modules/**',
    }),
  ],
  format: 'umd',
}

export default [
  options,
  Object.assign({}, options, {
    dest: 'dist/osc.js',
  }),
  Object.assign({}, options, {
    dest: 'dist/osc.min.js',
    plugins: options.plugins.concat(uglify()),
  }),
]
