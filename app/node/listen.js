const { ipcMain, app } = require('electron')
const open = require('open')
const request = require('./request')

ipcMain.on('exit', () => {
  app.exit(0)
})

ipcMain.on('openURL', (e, url) => {
  open(url)
})

ipcMain.on('request', (e, requestParams) => {
  request(requestParams)
    .then(json => e.sender.send('request-success', json))
    .catch((err) => {
      console.log(err)
      e.sender && e.sender.send('request-failed')
    })
})