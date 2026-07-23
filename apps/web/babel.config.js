// eslint-disable-next-line typescript/no-require-imports -- Next.js requires its Babel config to use CommonJS.
const path = require('node:path');

const dev = process.env.NODE_ENV !== 'production';

const stylexPlugin = [
  '@stylexjs/babel-plugin',
  {
    aliases: {
      '@/*': [path.join(__dirname, 'src/*')],
    },
    dev,
    enableInlinedConditionalMerge: true,
    runtimeInjection: false,
    treeshakeCompensation: true,
    unstable_moduleResolution: {
      rootDir: __dirname,
      type: 'commonJS',
    },
  },
];

module.exports = {
  plugins: [stylexPlugin],
  presets: ['next/babel'],
};
