module.exports = {
  extends: 'standard',
  plugins: [
    'babel',
    'standard',
    'promise',
    'graphql'
  ],
  parser: 'babel-eslint',
  env: {
    jest: true,
    node: true
  }
}
