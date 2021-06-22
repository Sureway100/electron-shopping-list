const electron = require('electron');
const url = require('url');
const path = require('path');
const { create } = require('domain');

//grab some stuff from electron

const {app, BrowserWindow, Menu, ipcMain} = electron;

//SET ENV
process.env.NODE_ENV = 'production';

//
// create a var to rep main window
let mainwindow;
let addwindow;


//
//listen for app to be ready
app.on('ready', function(){
    //create new window
    mainwindow = new BrowserWindow({
        webPreferences: {nodeIntegration: true, contextIsolation: false,},
    });
    //load html into window
    mainwindow.loadURL(url.format({
//file://dirname/mainwindow.html........passing it into loadURL
        pathname: path.join(__dirname, 'mainwindow.html'),
        protocol: 'file',
        slashes: true
    }));
    mainwindow.on('closed', function(){
        app.quit();
    })
    //build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //insert menu
    Menu.setApplicationMenu(mainMenu);
});

//quit app when main window closes




//
//handle create add window
function createAddwindow(){
     //create new window
     addwindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add shopping list item',
        //integrating html into node
        webPreferences: {nodeIntegration: true, contextIsolation: false,},
     });
     
     //load html into window
     addwindow.loadURL(url.format({
 //file://dirname/mainwindow.html........passing it into loadURL
         pathname: path.join(__dirname, 'addwindow.html'),
         protocol: 'file',
         slashes: true
     }));
     //garbage collection handle
     addwindow.on('close', function(){
         addwindow = null;
     });
}


//catch item add from addwindow
ipcMain.on('item:add', function(e, item){
    console.log(item);
    mainwindow.webContents.send('item:add', item);
    addwindow.close();
})

//
//create menu template
const mainMenuTemplate = [
    {
        label: 'file',
        submenu: [
            {
                label:'Add item',
                click(){
                    createAddwindow();
                }
            },
            {
                label: 'Clear items',
                click(){
                    mainwindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                //lets use a hot key for quit, use node> process.platform to know your os
                //accelerator: 'CmdorCtrl+Q'
                accelerator: process.platform == 'darwin' ? 'command+Q' : 'ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]

    }
];

// if mac, add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

//add developer tools item if not in production
if (process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu:[
            {
                label: 'Toogle DevTools',
                accelerator: process.platform == 'darwin' ? 'command+I' : 'ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}