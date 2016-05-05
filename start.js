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
  windows[windowMap['main']].loadURL('file://'+__dirname+'/windows/main/main.html');
}

function createTray(){
  let appIcon = new Tray('shared-resources/clock6.png');
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Log',
      accelerator: 'Super+Shift+L',
      click: function (item, focusedWindow){
        showLogWindow();
      }
    }, {
      label: 'Options',
      click: function (){
        //open options menu
      }
    }, {
      label: 'Quit',
      click: function (){
        app.quit();
      }
    }      
  ]);
  appIcon.setToolTip('This is my application.');
  appIcon.setContextMenu(contextMenu);
}

function registerGlobalShortcut(){
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

  //determine what size the window should be
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  console.log(width, height);

  //create the log window
  windows.push(new BrowserWindow({
    width: parseInt(width*0.9),
    height: 84,
    useContentSize: true,
    x: parseInt(width*0.05),
    y: parseInt(height*0.05),
    movable: false,
    frame: false
  }));
  windowMap['log'] = windows.length-1;
  //load the log page
  windows[windowMap['log']].setMenu(null);
  windows[windowMap['log']].loadURL('file://'+__dirname+'/windows/log/log.html');
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