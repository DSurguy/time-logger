const electron = require('electron');
// Module to control application life.
const {app, globalShortcut, Tray, Menu, BrowserWindow} = electron;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let windows = [];
let windowMap = {};

function createMainWindow(){
  windows.push(new BrowserWindow({
    width: 800,
    height: 640,
    show: false
  }));
  windowMap['main'] = windows.length-1;
  windows[windowMap['main']].loadURL('file://'+__dirname+'/index.html');
}

function createTray(){
  let appIcon = new Tray('clock6.png');
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Log',
      accelerator: 'Super+Shift+L',
      role: 'log',
      click: function (item, focusedWindow){
        showLogWindow();
      }
    }, {
      label: 'Quit',
      role: 'quit',
      click: function (){
        app.quit();
      }
    }
  ]);
  appIcon.setToolTip('This is my application.');
  appIcon.setContextMenu(contextMenu);
}

function registerGlobalShortcut(){
  // Register a 'CommandOrControl+X' shortcut listener.
  var ret = globalShortcut.register('Super+Shift+L', function() {
    showLogWindow();
  });

  if (!ret) {
    console.log('registration failed');
  }
};

function showLogWindow(){
  if( windowMap['log'] !== undefined ){
    return;
  }
  //create the log window
  windows.push(new BrowserWindow({
    width: 400,
    height: 84,
    x: 0,
    y: 0,
    movable: false
  }));
  windowMap['log'] = windows.length-1;
  //load the log page
  windows[windowMap['log']].setMenu(null);
  windows[windowMap['log']].loadURL('file://'+__dirname+'/log.html');
}

/*app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
*/
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function (){
  createMainWindow();

  createTray();

  registerGlobalShortcut();
});