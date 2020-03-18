const { app, BrowserWindow, Tray, ipcMain, Notification } = require('electron')
const path = require('path')
const open = require('open')
const appMenu = require('./app-menu')

const isDev = process.env.NODE_ENV === 'development'

if (isDev) {
  // hot reload
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron')
  })
}

app.dock.hide()
appMenu(isDev)

const renderDirectory = path.join(__dirname, 'render')

let mainWindow = null
let tray = null

function createWindow () {
  mainWindow = new BrowserWindow({
    width: isDev ? 820 : 420,
    height: 626,
    show: false,
    frame: false,
    fullscreenable: false,
    movable: false,
    resizable: false,
    alwaysOnTop: true,
    focusable: true,
    backgroundColor: 'transparent',
    webPreferences: {
      nodeIntegration: true,
      backgroundThrottling: false,
      defaultEncoding: 'utf-8',
    }
  })

  mainWindow.loadURL(`file://${path.join(renderDirectory, 'index.html')}`)
  mainWindow.on('blur', function () {
    mainWindow.hide()
  })
  mainWindow.on('show', function (e) {
    e.sender.send('windowDidShow')
  })

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }
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
  mainWindow.setPosition(position.x, position.y + 4, false);
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

app.allowRendererProcessReuse = true

app.whenReady().then(function () {
  createTray()
  createWindow()
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.on('exit', () => {
  app.exit(0)
})

ipcMain.on('openURL', (e, url) => {
  open(url)
})
