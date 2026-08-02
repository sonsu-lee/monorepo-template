import babelConfig from './babel.config.js';

const config = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      babelConfig: {
        babelrc: false,
        parserOpts: {
          plugins: ['typescript', 'jsx'],
        },
        plugins: babelConfig.plugins,
      },
      include: ['src/**/*.{js,ts,tsx}'],
      useCSSLayers: true,
    },
    autoprefixer: {},
  },
};

export default config;
