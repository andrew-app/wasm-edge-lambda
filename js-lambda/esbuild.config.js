import { build } from 'esbuild'

const options = {
  entryPoints: ['index.ts'],
  outfile: 'build/index.cjs',
  platform: 'node',
  bundle: true,
  minifyWhitespace: true,
  define: {
    'process.env.JWT_SECRET': JSON.stringify(process.env.JWT_SECRET)
  },
}

build(options).catch(() => process.exit(1))