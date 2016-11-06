import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'

const options = {
  entry: 'src/osc.js',
  dest: 'dist/osc.js',
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
    dest: 'dist/osc.min.js',
    plugins: options.plugins.concat(uglify()),
  }),
]
