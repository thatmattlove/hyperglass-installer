const path = require('path');

const mode = process.env.NODE_ENV || 'production';

module.exports = {
  entry: path.join(process.cwd(), 'src', 'index.ts'),
  target: 'webworker',
  context: __dirname,
  output: {
    filename: `worker.js`,
    path: path.join(process.cwd(), 'dist'),
  },
  mode,
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    modules: ['node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: { transpileOnly: true },
      },
    ],
  },
};
