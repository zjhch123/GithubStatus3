module.exports = {
  prodConfigChain: (webpackConfig) => {
    // Do something custom for webpack config - prod
    // return webpackConfig or not
  },
  devConfigChain: (webpackConfig) => {
    // Do something custom for webpack config - dev
    // return webpackConfig or not
    webpackConfig.devServer.proxy = {
      '/api': {
        target: 'https://github.com',
        pathRewrite: { '^/api' : '' },
        changeOrigin: true
      }
    }
  }
}