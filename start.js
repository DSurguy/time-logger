const electron = require('electron');
// Module to control application life.
const {app, globalShortcut, Tray, Menu, BrowserWindow, ipcMain} = electron;

//require('electron-debug')({showDevTools: true});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let windows = {};

function createMainWindow(){
  windows['main'] = new BrowserWindow({
    width: 800,
    height: 640,
    show: false
  });
  windows['main'].loadURL('file://'+__dirname+'/windows/main/main.html');
}

function createTray(){
  let appIcon = new Tray('shared-resources/clock6.png');
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Input',
      accelerator: 'Super+Shift+L',
      click: function (item, focusedWindow){
        showInputWindow();
      }
    }, {
      label: 'Log',
      click: function (){
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
    showInputWindow();
  });

  if (!ret) {
    console.log('registration failed');
  }
};

function showInputWindow(){
  if( windows['input'] !== undefined ){
    //we want to re-focus the window
    windows['input'].focus();
    //tell the window to re-focus the input element
    windows['input'].webContents.send('window-input', {action:'focus'});
    return;
  }

  //determine what size the window should be
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;

  //create the log window
  windows['input'] = new BrowserWindow({
    width: parseInt(width*0.9),
    height: 84,
    useContentSize: true,
    x: parseInt(width*0.05),
    y: parseInt(height*0.05),
    movable: false,
    frame: false
  });
  
  //load the log page
  windows['input'].setMenu(null);
  windows['input'].loadURL('file://'+__dirname+'/windows/input/input.html');
}

function showLogWindow(){
  if( windows['log'] !== undefined ){
    return;
  }

  //determine what size the window should be
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;

  //create the log window
  windows['log'] = new BrowserWindow({
    width: 400,
    height: 540,
    useContentSize: false,
    center: true
  });
  //load the log page
  windows['log'].setMenu(null);
  windows['log'].loadURL('file://'+__dirname+'/windows/log/log.html');
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function (){
  createMainWindow();

  createTray();

  registerGlobalShortcut();
});

ipcMain.on('window', (event, arg) => {
  switch(arg.action){
    case "close":
      closeWindow(arg.data);
    break;
  }
});

function closeWindow(data){
  if( windows[data.windowID] ){
    windows[data.windowID].close();
    delete windows[data.windowID];
  }
}