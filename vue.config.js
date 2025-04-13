const { defineConfig } = require('@vue/cli-service')
const path = require('path')
module.exports = defineConfig({
  configureWebpack: {
    entry: {
      app: path.resolve(__dirname, 'src/app/main.js')
    },
    resolve: {
      alias:{
        '@': path.resolve(__dirname, 'src')
      }
    }
  },
  transpileDependencies: true
})
