const { globalShortcut } = require('electron')

function preventDefault () {
  globalShortcut.register('CmdOrCtrl+R', () => {});
  globalShortcut.register('CmdOrCtrl+Q', () => {});
  globalShortcut.register('CmdOrCtrl+W', () => {});
  globalShortcut.register('CmdOrCtrl+A', () => {});
  globalShortcut.register('CmdOrCtrl+M', () => {});
}

module.exports = function initShortcut () {
  if (process.env.NODE_ENV !== 'development') {
    preventDefault()
  }
}

