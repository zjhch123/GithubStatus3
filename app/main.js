const { app, BrowserWindow, Tray } = require('electron')
const path = require('path')
const appMenu = require('./app-menu')

const isDev = process.env.NODE_ENV === 'development'

if (isDev) {
  require('./main.dev')
}

app.dock.hide()
appMenu(isDev)

const renderDirectory = path.join(__dirname, 'render')

let mainWindow = null
let tray = null

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 600,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    alwaysOnTop: true,
    focusable: true,
    backgroundColor: 'transparent',
    webPreferences: {
      nodeIntegration: true,
      backgroundThrottling: false
    }
  })

  mainWindow.loadURL(`file://${path.join(renderDirectory, 'index.html')}`)
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
  showMainWindow()
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
