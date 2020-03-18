const { Menu } = require('electron')

const template = [{
  label: 'Edit',
  submenu: [
    { role: 'undo' },
    { role: 'redo' },
    { type: 'separator' },
    { role: 'cut' },
    { role: 'copy' },
    { role: 'paste' },
    { role: 'delete' },
    { role: 'selectAll' },
  ]
}]

module.exports = function appMenu (isDev) {
  if (!isDev) {
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }
};
