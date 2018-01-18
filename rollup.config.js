import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import cleanup from 'rollup-plugin-cleanup'

function rollupPlugins(isUglified = false) {
  const plugins = [
    babel({
      babelrc: false,
      presets: ['es2015-rollup'],
      runtimeHelpers: false,
      externalHelpers: false,
      exclude: 'node_modules/**',
    }),
    cleanup(),
  ]

  return isUglified ? plugins.concat(uglify()) : plugins
}

function buildOptions(customOptions = {}) {
  const { input, file, isUglified } = customOptions

  const defaultOptions = {
    input: input || 'entry/osc.js',
    plugins: isUglified ? rollupPlugins(true) : rollupPlugins(),
    output: {
      file: file || 'lib/osc.js',
      name: 'OSC',
      format: 'umd',
      sourcemap: isUglified || false,
    },
  }

  return defaultOptions
}

export default [
  buildOptions(),
  buildOptions({
    input: 'entry/osc.browser.js',
    file: 'lib/osc.browser.js',
  }),
  buildOptions({
    input: 'entry/osc.browser.js',
    file: 'lib/osc.browser.min.js',
    isUglified: true,
  }),
]
