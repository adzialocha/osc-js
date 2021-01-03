import babel from 'rollup-plugin-babel'
import cleanup from 'rollup-plugin-cleanup'
import { terser } from 'rollup-plugin-terser'

function rollupPlugins(isUglified = false) {
  const plugins = [
    babel({
      exclude: 'node_modules/**',
    }),
    cleanup(),
  ]

  return isUglified ? plugins.concat(terser()) : plugins
}

function buildOptions(customOptions = {}) {
  const { file, isUglified } = customOptions

  const defaultOptions = {
    input: 'src/osc.js',
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
    file: 'lib/osc.min.js',
    isUglified: true,
  }),
]
