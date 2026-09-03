const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: [
    // PurgeCSS disabled due to build error. Re-enable after fixing plugin setup.
    ...(isProd
      ? [
          require('cssnano')({
            preset: 'default',
          }),
        ]
      : []),
  ],
};
