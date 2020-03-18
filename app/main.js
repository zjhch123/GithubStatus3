const { app, BrowserWindow, Tray, globalShortcut } = require('electron')
const path = require('path')
const initShortcut = require('./shortcut')

app.dock.hide()

const renderDirectory = path.join(__dirname, 'render')

let mainWindow = null
let tray = null

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    alwaysOnTop: true,
    focusable: true,
    webPreferences: {
      nodeIntegration: true,
      backgroundThrottling: false
    }
  })

  mainWindow.loadURL(`file://${path.join(renderDirectory, 'index.html')}`)

  // mainWindow.webContents.openDevTools()
  mainWindow.on('blur', function () {
    mainWindow.hide()
  })
}

function createTray () {
  tray = new Tray(path.join(renderDirectory, 'image', 'tray', 'icon.png'))
  tray.on('right-click', toggleMainWindow)
  tray.on('double-click', toggleMainWindow)
  tray.on('click', toggleMainWindow)
}

function toggleMainWindow () {
  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    showMainWindow()
  }
}

function showMainWindow () {
  const position = getWindowPosition();
  mainWindow.setPosition(position.x, position.y, false);
  mainWindow.show()
  mainWindow.focus()
}

function getWindowPosition () {
  const windowBounds = mainWindow.getBounds()
  const trayBounds = tray.getBounds()
  
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))
  const y = Math.round(trayBounds.y + trayBounds.height + 4)

  return {x: x, y: y}
}

app.whenReady().then(function () {
  createWindow()
  createTray()
  initShortcut()
  showMainWindow()
})

app.on('window-all-closed', function () {
  createWindow()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
