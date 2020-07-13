const {app,BrowserWindow} = require("electron");

const URL = "http://localhost/seven-circles/sq-editor.html";

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: "black",
        backgroundThrottling: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadURL(URL);
    mainWindow.webContents.openDevTools();
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
