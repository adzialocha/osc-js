import alias from '@rollup/plugin-alias'
import babel from '@rollup/plugin-babel'
import cleanup from 'rollup-plugin-cleanup'
import { terser } from 'rollup-plugin-terser'

function rollupPlugins({ isBrowser = false } = {}) {
  const plugins = [
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
    }),
    cleanup(),
  ]

  return isBrowser ? [alias({
    entries: [
      { find: 'ws', replacement: 'src/external/ws.js' },
      { find: 'dgram', replacement: 'src/external/dgram.js' },
    ],
  }), ...plugins, terser()] : plugins
}

function buildOptions(customOptions = {}) {
  const { file, isBrowser } = customOptions

  const defaultOptions = {
    input: 'src/osc.js',
    external: isBrowser ? [] : ['ws', 'dgram'],
    plugins: rollupPlugins({ isBrowser }),
    output: {
      globals: isBrowser ? {} : {
        ws: 'ws',
        dgram: 'dgram',
      },
      file: file || 'lib/osc.js',
      name: 'OSC',
      format: 'umd',
      sourcemap: isBrowser || false,
    },
  }

  return defaultOptions
}

export default [
  buildOptions(),
  buildOptions({
    file: 'lib/osc.min.js',
    isBrowser: true,
  }),
]
