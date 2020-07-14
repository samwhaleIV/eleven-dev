const {app,BrowserWindow,Menu} = require("electron");

const URL = "http://localhost/seven-circles/sq-editor.html";

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: "black",
        backgroundThrottling: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });
    mainWindow.loadURL(URL);
    mainWindow.on("closed",function(){
        mainWindow = null;
    });
}

app.on("ready",createWindow);

app.on("window-all-closed",function(){
    if(process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate",function(){
    if(mainWindow === null) {
        createWindow();
    }
});

const getAction = name => {
    return () => {
        if(!mainWindow) return;
        mainWindow.webContents.send("toolbar-command",name);
    };
};

const menuActions = {
    File: [
        ["Open","Control+O","file-open"],
        ["New","Control+N","file-new"],
        ["Save","Control+S","file-save"],
        ["Save As...","Control+Shift+S","file-save-as"]
    ],
    Edit: [
        ["Undo","Control+Z","edit-undo"],
        ["Redo","Control+R","edit-redo"],
        {type: "separator"},
        ["Select All","Control+A","edit-select-all"],
        ["Delete","Backspace","edit-delete"],
        {type: "separator"},
        ["Copy","Control+C","edit-copy"],
        ["Cut","Control+X","edit-cut"],
        ["Paste","Control+V","edit-past"]
    ]
};

const createTemplate = basicTemplate => {
    const template = [];
    const menuList = Object.entries(basicTemplate);
    for(const [label,menuItems] of menuList) {
        const submenu = new Array();

        for(const menuItem of menuItems) {
            if(!Array.isArray(menuItem)) {
                submenu.push(menuItem);
                continue;
            }
            const [label,accelerator,action] = menuItem;
            submenu.push({
                click: getAction(action),
                accelerator, label,
                registerAccelerator: false
            });
        }

        template.push({label,submenu});
    }
    return template;
};

const menu = Menu.buildFromTemplate(
    [...createTemplate(menuActions),{
        label: "Console", click: () => {
            if(mainWindow) mainWindow.webContents.openDevTools();
        }
    }]
);
Menu.setApplicationMenu(menu);
