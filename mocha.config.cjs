// mocha.config.cjs
module.exports = {
  require: ['@babel/register', 'jsdom-global/register'], // Ensuring jsdom-global is correctly required
  recursive: true,
  watchExtensions: ['js', 'jsx'],
  watchFiles: ['src/**/*.js', 'test/**/*.js'],
};
