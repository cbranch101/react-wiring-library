const {nodeExternalsPlugin} = require('esbuild-node-externals')

const {dependencies, peerDependencies} = require('../package.json')
const shared = {
  entryPoints: ['src/index.js'],
  target: 'node14',
  platform: 'node',
  minify: true,
  sourcemap: true,
  bundle: true,
  external: Object.keys(dependencies).concat(Object.keys(peerDependencies)),
  plugins: [nodeExternalsPlugin()],
}
require('esbuild')
  .build({
    ...shared,
    outfile: 'dist/index.js',
  })
  .catch(() => process.exit(1))

require('esbuild')
  .build({
    ...shared,
    format: 'esm',
    outfile: 'dist/index.esm.js',
  })
  .catch(() => process.exit(1))
